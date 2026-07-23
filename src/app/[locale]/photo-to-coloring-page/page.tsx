import type { Metadata } from "next";
import { ToolPage } from "@/components/ToolPage";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { getScenario, type ScenarioId } from "@/lib/scenarios";

const path = "/photo-to-coloring-page";
const title = "Photo to Coloring Page Converter Free Online";
const description =
  "Turn a picture into a clean printable coloring page. Upload a portrait, pet or family photo, choose a palette, and download a guided coloring kit.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { title, description, url: path, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function PhotoToColoringPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ preset?: string | string[] }> }) {
  const { locale } = await params;
  const query = await searchParams;
  const t = getDictionary(isLocale(locale) ? (locale as Locale) : "en");
  const requested = Array.isArray(query.preset) ? query.preset[0] : query.preset;
  const candidate = getScenario(requested ?? "photo");
  const presetId: ScenarioId = candidate.mode === "image" ? candidate.id : "photo";

  return (
    <ToolPage
      t={t}
      presetId={presetId}
      content={{
        path,
        mode: "image",
        eyebrow: "PHOTO TO COLORING PAGE",
        title,
        description,
        benefits: [],
        faq: [
          {
            question: "How can I turn a photo into a coloring page?",
            answer:
              "Upload a clear photo, optionally describe what to emphasize, choose the page shape and quality, then select Generate.",
          },
          {
            question: "Which photos work best?",
            answer:
              "Photos with one clear subject, good lighting and an uncluttered background produce the boldest and most recognizable coloring-page outlines.",
          },
          {
            question: "Can I convert pet and portrait photos?",
            answer:
              "Yes. The converter works well with pets, portraits, toys and familiar objects while simplifying fine texture for easier coloring.",
          },
          {
            question: "Will my uploaded photo stay private?",
            answer: "The source photo is stored under a random, non-indexed path so the image model can process it. It is never placed in a public gallery or shown to another user through the app.",
          },
          {
            question: "Can I make a coloring book from family photos?",
            answer: "Yes. Convert individual memories into printable pages, then export their line art and guides for a personalized family coloring book.",
          },
          {
            question: "What should I check before printing?",
            answer: "Check that the subject is recognizable, important features are complete, lines are clean and the page has comfortable white margins.",
          },
        ],
      }}
    />
  );
}
