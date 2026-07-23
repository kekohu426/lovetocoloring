import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDeviceId } from "@/lib/device";
import { isGenerationId } from "@/lib/download";
import { getGeneration } from "@/lib/generations";
import { printDocument } from "@/lib/print";
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

  return new Response(
    printDocument(await publicUrl(path), generation.prompt || "Coloring page"),
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "text/html; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
