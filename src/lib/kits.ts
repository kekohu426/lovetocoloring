import "server-only";
import { cradler, TABLES } from "./cradler";
import { getGeneration } from "./generations";
import { createGuidePackage } from "./image-processing";
import { parseStoredStepPaths } from "./kit-export";
import { parsePaletteJson } from "./palettes";
import { getScenario } from "./scenarios";
import { kitPath, publicUrl, storageBuffer, uploadBuffer } from "./storage";
import type { ColoringGuideDocument, ColoringKit, Generation } from "./types";

export async function getKit(id: string): Promise<ColoringKit | null> {
  try {
    return await cradler.from<ColoringKit>(TABLES.coloringKits).select().eq("id", id).first();
  } catch {
    return null;
  }
}

export async function getKitsForGeneration(generationId: string): Promise<ColoringKit[]> {
  try {
    const { rows } = await cradler.from<ColoringKit>(TABLES.coloringKits).select().eq("generationId", generationId).order("createdAt", { desc: true });
    return rows;
  } catch {
    return [];
  }
}

export async function findKitRequest(userId: string, clientRequestId: string): Promise<ColoringKit | null> {
  try {
    return await cradler
      .from<ColoringKit>(TABLES.coloringKits)
      .select()
      .eq("userId", userId)
      .eq("clientRequestId", clientRequestId)
      .order("createdAt", { desc: false })
      .first();
  } catch {
    return null;
  }
}

export async function getUserKits(userId: string): Promise<ColoringKit[]> {
  try {
    const { rows } = await cradler.from<ColoringKit>(TABLES.coloringKits).select().eq("userId", userId).order("createdAt", { desc: true }).limit(100);
    return rows;
  } catch {
    return [];
  }
}

export function ownsGeneration(generation: Generation, userId: string | null, deviceId: string): boolean {
  return generation.userId ? generation.userId === userId : generation.deviceId === deviceId;
}

function parseGuide(value: string | null): ColoringGuideDocument | null {
  try {
    const parsed = JSON.parse(value ?? "null");
    return parsed?.version === 3 && Array.isArray(parsed.steps) ? parsed as ColoringGuideDocument : null;
  } catch {
    return null;
  }
}

async function ensureGuideV3(kit: ColoringKit) {
  const currentGuide = parseGuide(kit.guideJson);
  const currentPaths = parseStoredStepPaths(kit.stepPathsJson);
  if (currentGuide && currentPaths.results.length === 4 && currentPaths.focus.length === 4) {
    return { kit, guide: currentGuide, paths: currentPaths };
  }

  const generation = await getGeneration(kit.generationId);
  const palette = parsePaletteJson(kit.paletteJson);
  if (!generation?.resultPath || !kit.coloredPath || !palette) {
    return { kit, guide: currentGuide, paths: currentPaths };
  }

  const [line, colored] = await Promise.all([
    storageBuffer(generation.resultPath),
    storageBuffer(kit.coloredPath),
  ]);
  const packageResult = await createGuidePackage(
    line,
    colored,
    palette,
    getScenario(generation.presetId).guideDifficulty,
  );
  const results: string[] = [];
  const focus: string[] = [];
  const coloredPath = await uploadBuffer(packageResult.final, kitPath(kit.id, "colored"));
  for (let index = 0; index < 4; index += 1) {
    results.push(await uploadBuffer(packageResult.steps[index], kitPath(kit.id, `step-${index + 1}`)));
    focus.push(await uploadBuffer(packageResult.focusSteps[index], kitPath(kit.id, `step-${index + 1}-focus`)));
  }
  const guide = { ...packageResult.guide, focusPaths: focus };
  const updatedAt = new Date().toISOString();
  const updated = {
    ...kit,
    updatedAt,
    coloredPath,
    stepPathsJson: JSON.stringify({ results, focus }),
    guideJson: JSON.stringify(guide),
  };
  await cradler.from<ColoringKit>(TABLES.coloringKits).update({
    updatedAt,
    coloredPath,
    stepPathsJson: updated.stepPathsJson,
    guideJson: updated.guideJson,
  }).eq("id", kit.id);
  return { kit: updated, guide, paths: { results, focus } };
}

export async function kitView(kit: ColoringKit) {
  const rebuilt = kit.status === "completed"
    ? await ensureGuideV3(kit)
    : { kit, guide: parseGuide(kit.guideJson), paths: parseStoredStepPaths(kit.stepPathsJson) };
  kit = rebuilt.kit;
  const generation = await getGeneration(kit.generationId);
  const versionedUrl = async (path: string) => {
    const url = await publicUrl(path);
    return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(kit.updatedAt)}`;
  };
  return {
    ...kit,
    palette: JSON.parse(kit.paletteJson),
    guide: rebuilt.guide ?? { version: 3, engine: "palette-fallback", steps: [] },
    lineUrl: generation?.resultPath ? await publicUrl(generation.resultPath) : null,
    coloredUrl: kit.coloredPath ? await versionedUrl(kit.coloredPath) : null,
    stepUrls: await Promise.all(rebuilt.paths.results.map(versionedUrl)),
    focusStepUrls: await Promise.all(rebuilt.paths.focus.map(versionedUrl)),
  };
}
