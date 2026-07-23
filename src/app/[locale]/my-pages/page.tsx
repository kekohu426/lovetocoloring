import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Download, Palette, Printer } from "lucide-react";
import { auth } from "@/lib/auth";
import { cradler, TABLES } from "@/lib/cradler";
import { getUserKits } from "@/lib/kits";
import { publicUrl } from "@/lib/storage";
import { downloadUrl, printUrl } from "@/lib/download";
import type { ColoringKit, CreditLedgerEntry, Generation } from "@/lib/types";

export const metadata: Metadata = { title: "My pages", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const reasonLabel: Record<string, string> = { signup_bonus: "Welcome credits", pack_purchase: "Credit pack", subscription_grant: "Subscription credits", test_grant: "Testing credits", generate: "Line art generation", coloring_kit: "Coloring kit", upscale: "HD upscaling", refund: "Refund" };
const activityDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

export default async function MyPages({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await auth();
  const view = (await searchParams).view === "credits" ? "credits" : "projects";
  if (!session?.user?.id) return <section className="account-page page-frame"><div className="empty-state"><h1>Your creative library</h1><p>Sign in to see saved line art, coloring guides and credit activity.</p><Link href="/api/auth/signin">Sign in</Link></div></section>;

  const [{ rows: generations }, kits, { rows: ledger }] = await Promise.all([
    cradler.from<Generation>(TABLES.generations).select().eq("userId", session.user.id).eq("status", "completed").order("createdAt", { desc: true }).limit(60),
    getUserKits(session.user.id),
    cradler.from<CreditLedgerEntry>(TABLES.creditLedger).select().eq("userId", session.user.id).order("createdAt", { desc: true }).limit(100),
  ]);
  const kitByGeneration = new Map<string, ColoringKit>();
  for (const kit of kits) if (kit.status === "completed" && !kitByGeneration.has(kit.generationId)) kitByGeneration.set(kit.generationId, kit);
  const pages = await Promise.all(generations.filter((item) => item.resultPath).map(async (item) => ({ ...item, image: await publicUrl(item.upscaledPath ?? item.resultPath!, { width: 500 }), kit: kitByGeneration.get(item.id) })));

  return <section className="account-page page-frame"><header><span className="eyebrow">YOUR WORKSPACE</span><h1>My pages</h1><p>Return to a line drawing, continue with a palette, or download a finished guide again.</p></header><nav className="account-tabs"><Link className={view === "projects" ? "active" : ""} href="/my-pages">Projects <span>{pages.length}</span></Link><Link className={view === "credits" ? "active" : ""} href="/my-pages?view=credits">Credit activity <span>{ledger.length}</span></Link></nav>
    {view === "projects" ? pages.length ? <div className="project-grid">{pages.map((page) => <article key={page.id}><div className="project-image"><img src={page.image} alt={page.prompt || "Coloring page"} /><span>{page.presetId ? page.presetId.replace(/(^\w)/, (letter) => letter.toUpperCase()) : "Custom"}</span></div><div className="project-copy"><time>{new Date(page.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time><h2>{page.prompt || "Untitled coloring page"}</h2>{page.kit ? <Link className="project-primary" href={`/kits/${page.kit.id}`}><BookOpen size={16} />Open coloring guide</Link> : <Link className="project-primary" href={`/projects/${page.id}/palette`}><Palette size={16} />Choose a palette</Link>}<div className="project-tools"><a href={downloadUrl(page.id)} download title="Download"><Download size={17} /></a><a href={printUrl(page.id)} target="_blank" rel="noreferrer" title="Print"><Printer size={17} /></a></div></div></article>)}</div> : <div className="empty-state"><h2>No pages yet</h2><p>Create a line drawing and it will stay here for your next coloring session.</p><Link href="/text-to-coloring-page">Create a page</Link></div> : <div className="ledger-table"><div className="ledger-head"><span>Activity</span><span>Date</span><span>Change</span><span>Balance</span></div>{ledger.map((entry) => <div key={entry.id}><strong data-label="Activity">{reasonLabel[entry.reason] ?? entry.reason}</strong><time data-label="Date" dateTime={entry.createdAt}>{activityDateFormatter.format(new Date(entry.createdAt))}</time><b data-label="Change" className={entry.delta > 0 ? "positive" : ""}>{entry.delta > 0 ? "+" : ""}{entry.delta}</b><span data-label="Balance">{entry.balanceAfter}</span></div>)}</div>}
  </section>;
}
