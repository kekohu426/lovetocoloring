import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getKit, kitView } from "@/lib/kits";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const kit = await getKit((await params).id);
  if (!kit || kit.userId !== session?.user?.id) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(await kitView(kit));
}
