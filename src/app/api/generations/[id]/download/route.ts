import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDeviceId } from "@/lib/device";
import { attachmentHeaders, isGenerationId } from "@/lib/download";
import { getGeneration } from "@/lib/generations";
import { publicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isGenerationId(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const generation = await getGeneration(id);
  if (!generation) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const session = await auth();
  const { deviceId } = await getDeviceId();
  const owns = generation.userId
    ? generation.userId === session?.user?.id
    : generation.deviceId === deviceId;
  if (!owns) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const path = generation.upscaledPath ?? generation.resultPath;
  if (!path) {
    return NextResponse.json({ error: "That page is not ready yet." }, { status: 409 });
  }

  const source = await fetch(await publicUrl(path), { cache: "no-store" });
  if (!source.ok || !source.body) {
    return NextResponse.json({ error: "Could not download that page." }, { status: 502 });
  }

  const headers = attachmentHeaders(
    path,
    source.headers.get("content-type") ?? "application/octet-stream",
    source.headers.get("content-length"),
  );
  return new Response(source.body, { status: 200, headers });
}
