import type { GenerationMode } from "./types";

export type ScenarioId = "kids" | "classroom" | "adult" | "photo" | "pet" | "family" | "birthday";
export type GuideDifficulty = "easy" | "guided" | "advanced";
export type ScenarioAudience = "Kids & Family" | "Classroom" | "Adult Coloring";
export type ScenarioDetail = "Simple" | "Balanced" | "Detailed";

export interface ScenarioField {
  id: string;
  label: string;
  type: "text" | "number" | "select";
  defaultValue: string;
  options?: readonly string[];
}

export interface ScenarioPreset {
  id: ScenarioId;
  mode: GenerationMode;
  label: string;
  description: string;
  audience: ScenarioAudience;
  detail: ScenarioDetail;
  promptTemplate?: string;
  fields: readonly ScenarioField[];
  paletteNames: readonly [string, string, string, string];
  guideDifficulty: GuideDifficulty;
  image: string;
}

export const SCENARIOS: Record<ScenarioId, ScenarioPreset> = {
  kids: {
    id: "kids", mode: "text", label: "Kids Coloring Page", audience: "Kids & Family", detail: "Simple",
    description: "Thick outlines, large coloring areas and an easy four-pass guide.",
    promptTemplate: "A friendly dinosaur exploring a cheerful garden with large closed shapes and a simple background",
    fields: [
      { id: "age", label: "Age range", type: "select", defaultValue: "Ages 4-6", options: ["Ages 4-6", "Ages 7-10"] },
      { id: "theme", label: "Favorite theme", type: "text", defaultValue: "Friendly animals" },
    ],
    paletteNames: ["Happy Primary", "Candy Garden", "Ocean Friends", "Soft Pastels"],
    guideDifficulty: "easy", image: "/scenarios/kids-line.webp",
  },
  classroom: {
    id: "classroom", mode: "text", label: "Classroom Worksheet", audience: "Classroom", detail: "Balanced",
    description: "Lesson-ready shapes and a palette teachers can demonstrate together.",
    promptTemplate: "A clear classroom worksheet about the solar system with visual groups but no written text",
    fields: [
      { id: "grade", label: "Grade range", type: "select", defaultValue: "Grades 1-3", options: ["Grades K-1", "Grades 1-3", "Grades 4-6"] },
      { id: "topic", label: "Lesson topic", type: "text", defaultValue: "The solar system" },
    ],
    paletteNames: ["Classroom Basics", "Science Lab", "Nature Lesson", "Quiet Time"],
    guideDifficulty: "guided", image: "/scenarios/classroom-line.webp",
  },
  adult: {
    id: "adult", mode: "text", label: "Adult Coloring", audience: "Adult Coloring", detail: "Detailed",
    description: "Finer outlines, layered detail and calm, nuanced color directions.",
    promptTemplate: "An intricate botanical mandala with balanced symmetry, clean fine outlines and many closed coloring regions",
    fields: [
      { id: "pattern", label: "Pattern type", type: "select", defaultValue: "Botanical", options: ["Botanical", "Geometric", "Fantasy"] },
      { id: "complexity", label: "Complexity", type: "select", defaultValue: "Detailed", options: ["Balanced", "Detailed", "Intricate"] },
    ],
    paletteNames: ["Botanical Calm", "Evening Jewel", "Earth & Ink", "Lavender Mist"],
    guideDifficulty: "advanced", image: "/scenarios/adult-line.webp",
  },
  photo: {
    id: "photo", mode: "image", label: "Keep Original Subject", audience: "Kids & Family", detail: "Balanced",
    description: "Preserve the person, animal or object actually shown in the uploaded photo.",
    fields: [
      { id: "background", label: "Background", type: "select", defaultValue: "Simplify it", options: ["Remove it", "Simplify it", "Keep key details"] },
    ],
    paletteNames: ["Original Colors", "Warm & Natural", "Bright & Playful", "Soft Keepsake"],
    guideDifficulty: "guided", image: "/scenarios/family-source.webp",
  },
  pet: {
    id: "pet", mode: "image", label: "Pet Coloring Page", audience: "Kids & Family", detail: "Balanced",
    description: "Keep recognizable features while simplifying fur and background clutter.",
    fields: [
      { id: "petType", label: "Pet type", type: "select", defaultValue: "Dog", options: ["Dog", "Cat", "Other pet"] },
      { id: "background", label: "Background", type: "select", defaultValue: "Simplify it", options: ["Remove it", "Simplify it", "Keep key details"] },
    ],
    paletteNames: ["Original Colors", "Warm & Natural", "Bright & Playful", "Fantasy Pet"],
    guideDifficulty: "guided", image: "/scenarios/pet-source.webp",
  },
  family: {
    id: "family", mode: "image", label: "Family Memory", audience: "Kids & Family", detail: "Balanced",
    description: "Keep the important people and pose while simplifying faces and scenery.",
    fields: [
      { id: "people", label: "People to keep", type: "number", defaultValue: "3" },
      { id: "background", label: "Background", type: "select", defaultValue: "Keep key details", options: ["Remove it", "Simplify it", "Keep key details"] },
    ],
    paletteNames: ["Photo Memory", "Golden Afternoon", "Soft Keepsake", "Celebration Color"],
    guideDifficulty: "guided", image: "/scenarios/family-source.webp",
  },
  birthday: {
    id: "birthday", mode: "text", label: "Birthday Activity", audience: "Kids & Family", detail: "Simple",
    description: "Personalize a party page with a name, age and favorite theme.",
    promptTemplate: "A joyful dinosaur birthday party with a cake, balloons, confetti and large closed coloring shapes, with a clean blank title banner at the top",
    fields: [
      { id: "name", label: "Child's name", type: "text", defaultValue: "Emma" },
      { id: "age", label: "Age", type: "number", defaultValue: "6" },
      { id: "theme", label: "Party theme", type: "text", defaultValue: "Dinosaur party" },
    ],
    paletteNames: ["Birthday Brights", "Confetti Pop", "Dino Party", "Pastel Celebration"],
    guideDifficulty: "easy", image: "/scenarios/birthday-line.webp",
  },
};

export function listScenarios(mode?: GenerationMode): ScenarioPreset[] {
  const items = Object.values(SCENARIOS);
  return mode ? items.filter((item) => item.mode === mode) : items;
}

export function getScenario(id: string | null | undefined): ScenarioPreset {
  return id && id in SCENARIOS ? SCENARIOS[id as ScenarioId] : SCENARIOS.kids;
}

export function getDefaultScenario(mode: GenerationMode): ScenarioPreset {
  return mode === "image" ? SCENARIOS.photo : SCENARIOS.kids;
}

export function sanitizeBirthdayText(value: string): string {
  return value.replace(/[<>]/g, "").trim().slice(0, 32);
}

export function normalizeScenarioValues(preset: ScenarioPreset, values: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(preset.fields.map((field) => {
    const raw = typeof values[field.id] === "string" ? String(values[field.id]).trim() : field.defaultValue;
    const selected = field.options && !field.options.includes(raw) ? field.defaultValue : raw;
    return [field.id, selected.slice(0, 80)];
  }));
}

export function buildScenarioPrompt(
  preset: ScenarioPreset,
  userPrompt: string,
  values: Record<string, unknown>,
  overrides?: { audience?: ScenarioAudience; detail?: ScenarioDetail },
): string {
  const safe = normalizeScenarioValues(preset, values);
  const details = preset.fields.map((field) => `${field.label}: ${safe[field.id]}`).join("; ");
  const subject = userPrompt.trim() || preset.promptTemplate || "A clear recognizable subject";
  const format = preset.id === "classroom"
    ? "classroom worksheet"
    : preset.id === "photo"
      ? "photo-based coloring page that preserves the original subject"
      : `${preset.label} coloring page`;
  const audience = overrides?.audience ?? preset.audience;
  const detail = overrides?.detail ?? preset.detail;
  return `${subject}. Create a ${format}. Audience: ${audience}. Detail: ${detail}. ${details}.`;
}
