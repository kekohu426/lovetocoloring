import type { GuideDifficulty, ScenarioId } from "./scenarios";

export interface PaletteOption {
  id: string;
  name: string;
  colors: string[];
}

const COLOR_SETS = [
  ["#F6E7D8", "#F8AFA6", "#F4CF73", "#7EC9C0", "#8BA6D9"],
  ["#F5D6DE", "#D7BDE2", "#A8DADC", "#B7D88B", "#F4C17A"],
  ["#FFD166", "#F78C6B", "#EF476F", "#4D9DE0", "#4CAF7D"],
  ["#D8E7C3", "#94C973", "#4E8D67", "#F2D3A2", "#A6C8E0"],
  ["#D7E3FC", "#ABC4FF", "#CDB4DB", "#FFC8DD", "#FFE5B4"],
  ["#403D39", "#7F5539", "#B08968", "#DDBEA9", "#EDE0D4"],
] as const;

const GENERIC_NAMES = ["Soft Pastels", "Morandi Calm", "Bold Pop", "Gentle Forest", "Candy Dream", "Earth & Ink"];

const SCENARIO_NAMES: Record<ScenarioId, readonly string[]> = {
  kids: ["Happy Primary", "Candy Garden", "Ocean Friends", "Soft Pastels"],
  classroom: ["Classroom Basics", "Science Lab", "Nature Lesson", "Quiet Time"],
  adult: ["Botanical Calm", "Evening Jewel", "Earth & Ink", "Lavender Mist"],
  photo: ["Original Colors", "Warm & Natural", "Bright & Playful", "Soft Keepsake"],
  pet: ["Original Colors", "Warm & Natural", "Bright & Playful", "Fantasy Pet"],
  family: ["Photo Memory", "Golden Afternoon", "Soft Keepsake", "Celebration Color"],
  birthday: ["Birthday Brights", "Confetti Pop", "Dino Party", "Pastel Celebration"],
};

function slug(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getPaletteOptions(scenarioId: ScenarioId | null): PaletteOption[] {
  const names = scenarioId ? SCENARIO_NAMES[scenarioId] : GENERIC_NAMES;
  return names.map((name, index) => ({ id: slug(name), name, colors: [...COLOR_SETS[index % COLOR_SETS.length]] }));
}

export function parsePaletteJson(value: string | null | undefined): PaletteOption | null {
  if (!value) return null;
  try {
    const input = JSON.parse(value) as Partial<PaletteOption>;
    const colors = Array.isArray(input.colors)
      ? input.colors.filter((color): color is string => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)).slice(0, 8)
      : [];
    if (!input.id || !input.name || colors.length < 2) return null;
    return { id: String(input.id), name: String(input.name), colors };
  } catch {
    return null;
  }
}

export function buildColoringPrompt(
  palette: PaletteOption,
  difficulty: GuideDifficulty,
  options?: { hasPhotoReference?: boolean; useOriginalPlacement?: boolean; enforceCoverage?: boolean },
): string {
  return [
    options?.hasPhotoReference
      ? "Image 1 is the line art to color. Image 2 is the original photo and must be used only to understand the identity of each subject and where semantic colors belong."
      : "Image 1 is the line art to color as a polished printable reference.",
    "Preserve the exact composition of Image 1, including its subjects, proportions, white margins and every original black outline.",
    "Apply color inside the existing closed line-art regions. Do not paint broad rectangular bands, stripes or blocks behind the subject.",
    "Fully color the main subject and every major enclosed interior region. No large region inside the main subject silhouette may remain pure white.",
    "Objects that are naturally white, including clothing, spacesuits, clouds, snow and white fur, must receive a clearly visible pale tint from the selected palette instead of remaining blank.",
    options?.useOriginalPlacement
      ? "Match the original photo's semantic color placement as closely as the limited palette allows: keep skin, hair or fur, clothing, accessories and background colors on their corresponding regions."
      : "Use natural semantic placement for skin, hair or fur, clothing, accessories and scenery while remapping them into the selected palette.",
    `Use this limited palette: ${palette.colors.join(", ")}.`,
    difficulty === "advanced" ? "Use controlled layering and subtle tonal variation." : "Use flat, clear color regions with strong separation.",
    options?.enforceCoverage
      ? "CORRECTION PASS: fill at least 90% of all enclosed regions inside the main subject. Pure white is allowed only for the page background and tiny shine highlights. Give the torso, headwear, arms, legs and every large accessory an obvious palette color."
      : "Keep only tiny intentional highlights white; every major enclosed region needs a visible color decision.",
    "Keep the page bright and print-friendly. Do not add text, objects, new scenery, borders, logos or watermarks.",
  ].join(" ");
}
