import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getKit, kitView } from "@/lib/kits";
import { ExportStudio } from "@/components/ExportStudio";
import { WorkflowSteps } from "@/components/WorkflowSteps";

export const dynamic = "force-dynamic";

export default async function KitExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/kits/${id}/export`)}`);
  const kit = await getKit(id);
  if (!kit || kit.userId !== session?.user?.id || kit.status !== "completed") notFound();
  const view = await kitView(kit);
  return <main className="workflow-page"><WorkflowSteps active={4} links={{ 2: `/projects/${kit.generationId}/palette`, 3: `/kits/${id}` }} /><ExportStudio id={id} lineUrl={view.lineUrl} coloredUrl={view.coloredUrl} stepUrls={view.stepUrls} /></main>;
}
