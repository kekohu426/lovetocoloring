import { NextResponse } from "next/server";
import { cradler, TABLES } from "@/lib/cradler";
import { completeGeneration, failGeneration } from "@/lib/generations";
import { parseCallbackResult } from "@/lib/imagegen";
import type { Generation } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Completion callback from apimodels.app.
 *
 * The provider sends no signature header, so the random token in the path *is*
 * the credential: it is generated per task and only ever travels to the
 * provider. An unknown token gets a 404 and no further processing.
 *
 * Always answer 2xx once handled — a non-2xx is retried for 30 minutes.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const generation = await cradler
    .from<Generation>(TABLES.generations)
    .select()
    .eq("callbackToken", token)
    .first();

  if (!generation) return NextResponse.json({ error: "Unknown task." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const data = body?.data;
  if (!data) return NextResponse.json({ ok: true });

  try {
    if (data.state === "completed") {
      // `resultJson` arrives as a JSON string, not an object.
      await completeGeneration(generation, parseCallbackResult(data.resultJson));
    } else if (data.state === "failed") {
      await failGeneration(generation, data.failMsg ?? "Generation failed.");
    }
  } catch {
    // Ask for a retry: the image is still in the provider's bucket for 7 days.
    return NextResponse.json({ error: "Could not store result." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
