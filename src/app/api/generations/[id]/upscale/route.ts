import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cradler, TABLES } from "@/lib/cradler";
import { CREDIT_COST } from "@/lib/config";
import { refundCredits, spendCredits } from "@/lib/credits";
import { getGeneration } from "@/lib/generations";
import { mirrorToStorage, publicUrl, resultPath } from "@/lib/storage";
import { runUpscale, upscaleConfigured } from "@/lib/upscale";
import type { Generation } from "@/lib/types";

export const maxDuration = 60;

/** HD upscaling of a finished page. Sign-in required — this is a paid action. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in to make HD pages.", code: "signin_required" }, { status: 401 });
  }

  if (!upscaleConfigured()) {
    return NextResponse.json(
      { error: "HD is not available yet.", code: "not_configured" },
      { status: 503 },
    );
  }

  const generation = await getGeneration(id);
  if (!generation || generation.userId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (generation.status !== "completed" || !generation.resultPath) {
    return NextResponse.json({ error: "That page is not finished yet." }, { status: 409 });
  }
  if (generation.upscaledPath) {
    return NextResponse.json({ url: await publicUrl(generation.upscaledPath) });
  }

  const spend = await spendCredits(userId, CREDIT_COST.upscale, "upscale", generation.id);
  if (!spend.ok) {
    return NextResponse.json({ error: "You are out of credits.", code: spend.reason }, { status: 402 });
  }

  try {
    const result = await runUpscale(await publicUrl(generation.resultPath));
    if (!("url" in result)) {
      return NextResponse.json({ status: "processing", taskId: result.taskId });
    }

    const path = await mirrorToStorage(result.url, resultPath(generation.id, "upscaled"));
    await cradler.from<Generation>(TABLES.generations).update({ upscaledPath: path }).eq("id", generation.id);

    return NextResponse.json({ url: await publicUrl(path) });
  } catch {
    await refundCredits(userId, spend.charged, generation.id);
    return NextResponse.json(
      { error: "HD failed. You were not charged.", code: "upscale_failed" },
      { status: 502 },
    );
  }
}
