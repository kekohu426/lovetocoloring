import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDeviceId } from "@/lib/device";
import { getGeneration, reconcileGeneration } from "@/lib/generations";
import { publicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * Status endpoint the generator polls. Reconciles with the provider on every
 * read, so results still land when the webhook cannot reach this host.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const found = await getGeneration(id);
  if (!found) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const session = await auth();
  const { deviceId } = await getDeviceId();
  const owns = found.userId ? found.userId === session?.user?.id : found.deviceId === deviceId;
  if (!owns) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const generation = await reconcileGeneration(found);

  return NextResponse.json({
    id: generation.id,
    status: generation.status,
    tier: generation.tier,
    url: generation.resultPath ? await publicUrl(generation.resultPath) : null,
    upscaledUrl: generation.upscaledPath ? await publicUrl(generation.upscaledPath) : null,
    failMsg: generation.failMsg,
  });
}
