import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDeviceId } from "@/lib/device";
import { downloadUrl } from "@/lib/download";
import { getGeneration } from "@/lib/generations";
import { getKitsForGeneration, ownsGeneration } from "@/lib/kits";
import { getPaletteOptions, type PaletteOption } from "@/lib/palettes";
import { publicUrl } from "@/lib/storage";
import { findUserById } from "@/lib/users";
import { isSubscribed } from "@/lib/credits";
import { PaletteStudio } from "@/components/PaletteStudio";
import { WorkflowSteps } from "@/components/WorkflowSteps";

export const dynamic = "force-dynamic";

export default async function PalettePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, generation, device] = await Promise.all([auth(), getGeneration(id), getDeviceId()]);
  if (!generation || !ownsGeneration(generation, session?.user?.id ?? null, device.deviceId) || generation.status !== "completed" || !generation.resultPath) notFound();
  let palettes: PaletteOption[] = [];
  try { palettes = JSON.parse(generation.paletteOptionsJson ?? "[]"); } catch {}
  if (!palettes.length) palettes = getPaletteOptions(null);
  const kits = session?.user?.id ? await getKitsForGeneration(id) : [];
  const user = session?.user?.id ? await findUserById(session.user.id) : null;
  const existing = Object.fromEntries(kits.filter((kit) => kit.status === "completed").map((kit) => [kit.paletteId, kit.id]));
  return <main className="workflow-page"><WorkflowSteps active={2} links={{ 1: generation.mode === "image" ? "/photo-to-coloring-page" : "/text-to-coloring-page" }} /><PaletteStudio generationId={id} mode={generation.mode} lineUrl={await publicUrl(generation.resultPath)} palettes={palettes} signedIn={Boolean(user)} credits={user?.credits ?? 0} unlimited={user ? isSubscribed(user) : false} existing={existing} downloadHref={downloadUrl(id)} /></main>;
}
