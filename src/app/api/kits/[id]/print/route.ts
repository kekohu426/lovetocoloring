import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getKit, kitView } from "@/lib/kits";

function escape(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const kit = await getKit((await params).id);
  if (!kit || kit.userId !== session?.user?.id) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const view = await kitView(kit);
  const steps = view.stepUrls.map((url, index) => `<figure><img src="${escape(url)}"/><figcaption>Step ${index + 1}: ${escape(view.guide.steps[index]?.title ?? "Add the next colors")}</figcaption></figure>`).join("");
  const colors = view.palette.colors.map((color: string) => `<span><i style="background:${escape(color)}"></i>${escape(color)}</span>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Magic Coloring Guide</title><style>@page{size:auto;margin:12mm}*{box-sizing:border-box}body{font:14px Arial,sans-serif;color:#17171a;margin:0}h1{text-align:center;margin:0 0 18px}.hero{width:100%;max-height:58vh;object-fit:contain}.colors{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:16px}.colors span{display:flex;align-items:center;gap:6px}.colors i{width:22px;height:22px;border-radius:4px;border:1px solid #ddd}.steps{display:grid;grid-template-columns:1fr 1fr;gap:12px;page-break-before:always}.steps figure{margin:0;break-inside:avoid}.steps img{width:100%;max-height:320px;object-fit:contain}.steps figcaption{margin-top:6px}@media print{button{display:none}}</style></head><body><h1>${escape(view.palette.name)} Coloring Guide</h1><img class="hero" src="${escape(view.coloredUrl ?? "")}"/><div class="colors">${colors}</div><section class="steps">${steps}</section><script>window.addEventListener("load",()=>window.print());</script></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" } });
}
