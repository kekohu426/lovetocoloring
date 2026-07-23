import type { Metadata } from "next";
import { ToolPage } from "@/components/ToolPage";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { getScenario, type ScenarioId } from "@/lib/scenarios";

const path = "/text-to-coloring-page";
const title = "Text to Coloring Page Generator Free Online";
const description =
  "Turn a text prompt into printable coloring page line art. Choose coordinated palettes, create a colored reference, and download a step-by-step guide.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { title, description, url: path, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function TextToColoringPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ preset?: string | string[]; prompt?: string | string[] }> }) {
  const { locale } = await params;
  const query = await searchParams;
  const t = getDictionary(isLocale(locale) ? (locale as Locale) : "en");
  const requested = Array.isArray(query.preset) ? query.preset[0] : query.preset;
  const prompt = Array.isArray(query.prompt) ? query.prompt[0] : query.prompt;
  const candidate = getScenario(requested);
  const presetId: ScenarioId = candidate.mode === "text" ? candidate.id : "kids";

  return (
    <ToolPage
      t={t}
      presetId={presetId}
      initialPrompt={prompt?.slice(0, 500)}
      content={{
        path,
        mode: "text",
        eyebrow: "TEXT TO COLORING PAGE",
        title,
        description,
        benefits: [],
        faq: [
          {
            question: "How do I turn text into a coloring page?",
            answer:
              "Enter a short description, choose the page shape and quality, then select Generate. The tool redraws your idea as printable black-and-white outlines.",
          },
          {
            question: "What text prompts make the best coloring pages?",
            answer:
              "Use one recognizable subject, a simple action and a light background. Fewer objects create larger spaces that are easier to color.",
          },
          {
            question: "Can I print the generated coloring page?",
            answer:
              "Yes. Every finished page can be downloaded or printed directly, and the optional HD version keeps lines sharp on A4 and Letter paper.",
          },
          {
            question: "Does the generator provide color ideas?",
            answer: "Yes. After the line art is ready, compare coordinated palettes and turn the one you choose into a finished reference and four-step guide.",
          },
          {
            question: "Can I make adult coloring pages from text?",
            answer: "Yes. Select the Adult Coloring preset and a detailed level for denser botanical, geometric or imaginative pages.",
          },
          {
            question: "Can teachers create classroom coloring sheets?",
            answer: "Yes. Classroom mode favors clear educational subjects, printable layouts and coloring steps that can be demonstrated to a group.",
          },
        ],
      }}
    />
  );
}
