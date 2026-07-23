import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getKit, kitView } from "@/lib/kits";
import { getGeneration } from "@/lib/generations";
import { ColorGuideStudio } from "@/components/ColorGuideStudio";
import { WorkflowSteps } from "@/components/WorkflowSteps";

export const dynamic = "force-dynamic";

export default async function KitGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/kits/${id}`)}`);
  const kit = await getKit(id);
  if (!kit || kit.userId !== session?.user?.id || kit.status !== "completed") notFound();
  const [view, generation] = await Promise.all([kitView(kit), getGeneration(kit.generationId)]);
  const projectTitle = generation?.prompt?.trim() || "Untitled coloring page";
  return <main className="workflow-page guide-flow-page"><WorkflowSteps active={3} links={{ 2: `/projects/${kit.generationId}/palette`, 4: `/kits/${id}/export` }} /><ColorGuideStudio id={id} generationId={kit.generationId} projectTitle={projectTitle} palette={view.palette} coloredUrl={view.coloredUrl ?? ""} stepUrls={view.stepUrls} focusStepUrls={view.focusStepUrls} guide={view.guide} /></main>;
}
