import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CREDIT_COST, TIERS } from "@/lib/config";
import { cradler, TABLES } from "@/lib/cradler";
import { refundCredits, spendCredits } from "@/lib/credits";
import { getDeviceId } from "@/lib/device";
import { getGeneration } from "@/lib/generations";
import { createTask } from "@/lib/imagegen";
import { findKitRequest, kitView, ownsGeneration } from "@/lib/kits";
import { buildColoringPrompt, getPaletteOptions, type PaletteOption } from "@/lib/palettes";
import { getScenario, type ScenarioId } from "@/lib/scenarios";
import { kitPath, mirrorToStorage, publicUrl, storageBuffer, uploadBuffer } from "@/lib/storage";
import type { ColoringKit } from "@/lib/types";

export const maxDuration = 120;
export const runtime = "nodejs";

function paletteOptions(value: string | null | undefined, presetId: string | null | undefined): PaletteOption[] {
  try {
    const parsed = JSON.parse(value ?? "[]");
    if (Array.isArray(parsed) && parsed.length) return parsed as PaletteOption[];
  } catch {}
  return getPaletteOptions((presetId as ScenarioId | null) ?? null);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Sign in to generate a coloring kit.", code: "signin_required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const clientRequestId = typeof body?.clientRequestId === "string" ? body.clientRequestId : "";
  if (clientRequestId.length < 8 || clientRequestId.length > 80) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const existing = await findKitRequest(userId, clientRequestId);
  if (existing) return NextResponse.json(await kitView(existing));

  const { id } = await params;
  const generation = await getGeneration(id);
  const { deviceId } = await getDeviceId();
  if (!generation || !ownsGeneration(generation, userId, deviceId)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (generation.status !== "completed" || !generation.resultPath) return NextResponse.json({ error: "That line art is not ready." }, { status: 409 });

  if (!generation.userId) {
    await cradler.from(TABLES.generations).update({ userId }).eq("id", generation.id);
  }

  const palette = paletteOptions(generation.paletteOptionsJson, generation.presetId).find((item) => item.id === body?.paletteId);
  if (!palette) return NextResponse.json({ error: "Choose a valid palette." }, { status: 400 });

  const { rows } = await cradler.from<ColoringKit>(TABLES.coloringKits).insert({
    generationId: generation.id, userId, clientRequestId, paletteId: palette.id,
    paletteJson: JSON.stringify(palette), model: TIERS.standard.imageModel, status: "pending",
    coloredPath: "", stepPathsJson: "[]", guideJson: "[]", failMsg: "", creditsSpent: 0,
  });
  const kit = rows[0];
  const canonical = await findKitRequest(userId, clientRequestId);
  if (canonical && canonical.id !== kit.id) {
    await cradler.from<ColoringKit>(TABLES.coloringKits).update({ status: "failed", failMsg: "Duplicate request." }).eq("id", kit.id);
    return NextResponse.json(await kitView(canonical));
  }
  const spend = await spendCredits(userId, CREDIT_COST.coloringKit, "coloring_kit", kit.id, "standard");
  if (!spend.ok) {
    await cradler.from<ColoringKit>(TABLES.coloringKits).update({ status: "failed", failMsg: "Insufficient credits." }).eq("id", kit.id);
    return NextResponse.json({ error: "You need 1 credit to create this coloring kit.", code: spend.reason, balance: spend.balance }, { status: 402 });
  }
  await cradler.from<ColoringKit>(TABLES.coloringKits).update({ status: "processing", creditsSpent: spend.charged }).eq("id", kit.id);

  let stage = "coloring";
  try {
    const {
      createGuidePackage,
      createSwatchImage,
      measureColorCoverage,
    } = await import("@/lib/image-processing");
    const scenario = getScenario(generation.presetId);
    const lineUrl = await publicUrl(generation.resultPath);
    const line = await storageBuffer(generation.resultPath);
    const photoUrl = generation.mode === "image" && generation.sourcePath
      ? await publicUrl(generation.sourcePath)
      : null;
    let bestResult: { url: string; ratio: number } | null = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      stage = attempt === 0 ? "coloring" : "retrying incomplete color coverage";
      const task = await createTask({
        model: TIERS.standard.imageModel,
        prompt: buildColoringPrompt(palette, scenario.guideDifficulty, {
          hasPhotoReference: Boolean(photoUrl),
          useOriginalPlacement: palette.id === "original-colors",
          enforceCoverage: attempt > 0,
        }),
        size: generation.size ?? "portrait",
        imageUrl: lineUrl,
        imageUrls: photoUrl ? [lineUrl, photoUrl] : [lineUrl],
      });
      if (task.state !== "completed" || !task.resultUrls?.[0]) throw new Error("The color model returned no image.");
      const response = await fetch(task.resultUrls[0], { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not inspect the colored result (${response.status}).`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const coverage = await measureColorCoverage(line, buffer);
      if (!bestResult || coverage.ratio > bestResult.ratio) bestResult = { url: task.resultUrls[0], ratio: coverage.ratio };
      if (coverage.ratio >= .72) break;
    }
    if (!bestResult || bestResult.ratio < .72) throw new Error(`Color coverage was incomplete (${Math.round((bestResult?.ratio ?? 0) * 100)}%).`);

    stage = "saving colored artwork";
    const rawColoredPath = await mirrorToStorage(bestResult.url, kitPath(kit.id, "colored"));
    stage = "building guide steps";
    const colored = await storageBuffer(rawColoredPath);
    const guidePackage = await createGuidePackage(line, colored, palette, scenario.guideDifficulty);
    const coloredPath = await uploadBuffer(guidePackage.final, kitPath(kit.id, "colored"));
    console.info("Coloring step engine completed", {
      kitId: kit.id,
      engine: guidePackage.engine,
      ...guidePackage.quality,
    });
    const stepPaths: string[] = [];
    const focusPaths: string[] = [];
    for (let index = 0; index < guidePackage.steps.length; index += 1) {
      stage = `saving guide step ${index + 1}`;
      stepPaths.push(await uploadBuffer(guidePackage.steps[index], kitPath(kit.id, `step-${index + 1}`)));
      focusPaths.push(await uploadBuffer(guidePackage.focusSteps[index], kitPath(kit.id, `step-${index + 1}-focus`)));
    }
    stage = "saving color swatch";
    await uploadBuffer(await createSwatchImage(palette), kitPath(kit.id, "swatch"));
    await cradler.from<ColoringKit>(TABLES.coloringKits).update({
      status: "completed",
      coloredPath,
      stepPathsJson: JSON.stringify({ results: stepPaths, focus: focusPaths }),
      guideJson: JSON.stringify({ ...guidePackage.guide, focusPaths }),
      failMsg: null,
    }).eq("id", kit.id);
    const completed = await cradler.from<ColoringKit>(TABLES.coloringKits).select().eq("id", kit.id).first();
    return NextResponse.json(await kitView(completed!));
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Coloring kit generation failed.";
    const message = `${stage}: ${detail}`;
    console.error("Coloring kit generation failed", { kitId: kit.id, generationId: generation.id, stage, detail });
    await cradler.from<ColoringKit>(TABLES.coloringKits).update({ status: "failed", failMsg: message }).eq("id", kit.id);
    if (spend.charged > 0) await refundCredits(userId, spend.charged, kit.id);
    return NextResponse.json({ error: "The coloring kit could not be generated. Your credit was refunded." }, { status: 502 });
  }
}
