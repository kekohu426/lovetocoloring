import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cradler, TABLES } from "@/lib/cradler";
import { SITE, TIERS, type Tier } from "@/lib/config";
import { refundCredits, spendCredits } from "@/lib/credits";
import {
  clientIp,
  consumeFreeGeneration,
  deviceCookie,
  freeGenerationsLeft,
  getDeviceId,
  releaseFreeGeneration,
} from "@/lib/device";
import { createTask, type SizeKey } from "@/lib/imagegen";
import { completeGeneration } from "@/lib/generations";
import { buildPrompt, validatePrompt } from "@/lib/prompt";
import { publicUrl } from "@/lib/storage";
import type { Generation, GenerationMode } from "@/lib/types";
import {
  buildScenarioPrompt,
  getScenario,
  normalizeScenarioValues,
  type ScenarioAudience,
  type ScenarioDetail,
} from "@/lib/scenarios";
import { getPaletteOptions } from "@/lib/palettes";

export const maxDuration = 60;
export const runtime = "nodejs";

const AUDIENCES: readonly ScenarioAudience[] = ["Kids & Family", "Classroom", "Adult Coloring"];
const DETAILS: readonly ScenarioDetail[] = ["Simple", "Balanced", "Detailed"];

function bad(error: string, code: string, status = 400) {
  return NextResponse.json({ error, code }, { status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mode: GenerationMode = body?.mode === "image" ? "image" : "text";
  const tier: Tier = body?.tier === "pro" ? "pro" : "standard";
  const size: SizeKey = (["portrait", "square", "landscape"] as const).includes(body?.size)
    ? body.size
    : "portrait";
  const prompt: string = typeof body?.prompt === "string" ? body.prompt : "";
  const sourcePath: string | null = typeof body?.sourcePath === "string" ? body.sourcePath : null;
  const requestedPreset = typeof body?.presetId === "string" ? getScenario(body.presetId) : null;
  const preset = requestedPreset?.mode === mode ? requestedPreset : null;
  const presetValues = body?.presetValues && typeof body.presetValues === "object" ? body.presetValues : {};
  const audience = AUDIENCES.includes(body?.audience) ? body.audience as ScenarioAudience : preset?.audience;
  const detail = DETAILS.includes(body?.detail) ? body.detail as ScenarioDetail : preset?.detail;
  const normalizedPresetValues = preset ? normalizeScenarioValues(preset, presetValues) : {};
  const effectivePrompt = preset
    ? buildScenarioPrompt(preset, prompt, normalizedPresetValues, { audience, detail })
    : prompt;

  const invalid = validatePrompt(effectivePrompt, mode);
  if (invalid) return bad(invalid, "invalid_prompt");
  if (mode === "image" && !sourcePath) return bad("Upload a photo first.", "missing_source");

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { deviceId, shouldSet } = await getDeviceId();
  const ip = clientIp(req);

  // Charge before dispatching, so parallel requests cannot share one balance.
  let creditsSpent = 0;
  if (userId) {
    const spend = await spendCredits(userId, TIERS[tier].cost, "generate", null, tier);
    if (!spend.ok) {
      return bad(
        spend.reason === "fair_use_exceeded"
          ? "You have reached this month's fair-use limit for that quality."
          : "You are out of credits.",
        spend.reason,
        402,
      );
    }
    creditsSpent = spend.charged;
  } else {
    if (tier === "pro") return bad("Sign in to use Pro quality.", "signin_required", 401);
    if ((await freeGenerationsLeft(deviceId, ip)) <= 0) {
      return bad("You have used your free pages. Sign in to keep going.", "free_used", 402);
    }
    await consumeFreeGeneration(deviceId, ip);
  }

  const callbackToken = crypto.randomUUID();
  const model = mode === "image" ? TIERS[tier].imageModel : TIERS[tier].model;
  const { rows } = await cradler.from<Generation>(TABLES.generations).insert({
    userId,
    deviceId,
    mode,
    tier,
    model,
    prompt: effectivePrompt,
    sourcePath,
    status: "pending",
    taskId: null,
    callbackToken,
    resultPath: null,
    upscaledPath: null,
    failMsg: null,
    creditsSpent,
    presetId: preset?.id ?? null,
    settingsJson: JSON.stringify({ ...normalizedPresetValues, audience, detail }),
    size,
    paletteOptionsJson: JSON.stringify(getPaletteOptions(preset?.id ?? null)),
  });
  const generation = rows[0];

  try {
    const imageUrl = sourcePath ? await publicUrl(sourcePath) : undefined;
    const { taskId, state, resultUrls } = await createTask({
      model,
      prompt: buildPrompt(effectivePrompt, mode),
      size,
      imageUrl,
      // Webhooks only reach a deployed site; local runs fall back to polling.
      callbackUrl: `${SITE.url}/api/webhooks/image/${callbackToken}`,
    });

    if (state === "completed" && resultUrls?.length) {
      await completeGeneration(generation, resultUrls);
    } else {
      await cradler
        .from<Generation>(TABLES.generations)
        .update({ taskId, status: state === "failed" ? "failed" : "processing" })
        .eq("id", generation.id);
    }

    const res = NextResponse.json({
      id: generation.id,
      status: state === "completed" ? "completed" : "processing",
    });
    if (shouldSet) res.cookies.set(deviceCookie(deviceId));
    return res;
  } catch (err) {
    // The task never started, so nothing was billed by the provider either.
    await cradler
      .from<Generation>(TABLES.generations)
      .update({ status: "failed", failMsg: err instanceof Error ? err.message : "dispatch failed" })
      .eq("id", generation.id);

    if (userId && creditsSpent > 0) await refundCredits(userId, creditsSpent, generation.id);
    else if (!userId) await releaseFreeGeneration(deviceId);

    return bad("Something went wrong. You were not charged - please try again.", "dispatch_failed", 502);
  }
}
