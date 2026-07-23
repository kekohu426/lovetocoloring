import type { GenerationMode } from "./types";

/**
 * Wraps the user's words in a coloring-page brief. The model is a general image
 * model, so without this it happily returns a shaded colour illustration —
 * these constraints are what make the output printable line art.
 */
const LINE_ART_RULES = [
  "black and white line art coloring book page",
  "clean bold uniform black outlines on a pure white background",
  "no shading, no greyscale, no hatching, no gradients, no fill",
  "large open areas that are easy to colour in",
  "centred composition with generous white margins",
  "printable, high contrast, vector-like clarity",
].join(", ");

const NEGATIVES =
  "Do not add colour, do not add grey tones, do not add a background scene, do not add text, watermarks or borders.";

export function buildPrompt(userPrompt: string, mode: GenerationMode): string {
  const subject = userPrompt.trim();

  if (mode === "image") {
    return [
      `Redraw the subject of this photo as a ${LINE_ART_RULES}.`,
      "Treat the uploaded photo as the sole source of truth for subject identity and subject type.",
      "Keep every main subject as the same person, animal species, or object shown in the photo.",
      "Never replace a person with an animal, replace an animal with a person, invent a pet, or change the species.",
      "Keep the subject's pose, proportions and recognisable facial features, but simplify",
      "textures and fine detail into clean continuous outlines.",
      subject ? `Additional direction: ${subject}.` : "",
      NEGATIVES,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [`${subject}. Drawn as a ${LINE_ART_RULES}.`, NEGATIVES].join(" ");
}

/** Cheap guard so obviously unusable prompts never reach the paid API. */
export function validatePrompt(prompt: string, mode: GenerationMode): string | null {
  const trimmed = prompt.trim();
  if (mode === "text" && trimmed.length < 3) {
    return "Describe what you want to colour in — a few words is enough.";
  }
  if (trimmed.length > 800) return "That description is too long. Keep it under 800 characters.";
  return null;
}
