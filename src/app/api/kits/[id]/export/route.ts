import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exportFilename, parseExportFormat, parseExportSelection } from "@/lib/kit-export";
import { buildKitExport } from "@/lib/kit-exporter";
import { getKit } from "@/lib/kits";

export const maxDuration = 60;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const kit = await getKit((await params).id);
  if (!kit || kit.userId !== session?.user?.id) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (kit.status !== "completed") return NextResponse.json({ error: "That kit is not ready." }, { status: 409 });

  const url = new URL(req.url);
  const format = parseExportFormat(url.searchParams.get("format"));
  const selection = parseExportSelection(url.searchParams.get("include"));
  try {
    const output = await buildKitExport(kit, format, selection);
    return new Response(new Uint8Array(output.body), {
      headers: {
        "Content-Type": output.type,
        "Content-Disposition": `attachment; filename="${exportFilename(format)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Kit export failed", error);
    return NextResponse.json({ error: "Could not build that download." }, { status: 502 });
  }
}
