import "server-only";
import { cradler, TABLES } from "./cradler";
import { refundCredits } from "./credits";
import { getTask } from "./imagegen";
import { mirrorToStorage, resultPath, storageBuffer, uploadBuffer } from "./storage";
import { releaseFreeGeneration } from "./device";
import type { Generation } from "./types";
import { getPaletteOptions } from "./palettes";
import { getScenario, sanitizeBirthdayText, type ScenarioId } from "./scenarios";

export async function getGeneration(id: string): Promise<Generation | null> {
  return cradler.from<Generation>(TABLES.generations).select().eq("id", id).first();
}

function extFrom(url: string): string {
  const match = /\.(png|jpe?g|webp)(?:\?|$)/i.exec(url);
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "png";
}

/**
 * Copies the finished image out of the provider's 7-day bucket and marks the
 * row complete. Safe to call twice — a second delivery of the same webhook
 * finds `resultPath` already set and returns without re-uploading.
 */
export async function completeGeneration(generation: Generation, resultUrls: string[]): Promise<void> {
  if (generation.resultPath) return;

  const source = resultUrls[0];
  if (!source) {
    await failGeneration(generation, "The provider returned no image.");
    return;
  }

  let path = await mirrorToStorage(source, resultPath(generation.id, "result", extFrom(source)));
  let paletteOptions = getPaletteOptions((generation.presetId as ScenarioId | null) ?? null);

  if (generation.presetId === "birthday" && generation.settingsJson) {
    try {
      const { overlayBirthdayTitle } = await import("./image-processing");
      const values = JSON.parse(generation.settingsJson) as Record<string, string>;
      const named = await overlayBirthdayTitle(
        await storageBuffer(path),
        sanitizeBirthdayText(values.name ?? "Birthday"),
        String(Math.max(1, Number(values.age) || 1)),
      );
      path = await uploadBuffer(named, resultPath(generation.id, "result"));
    } catch (error) {
      console.error("Birthday title overlay failed", error);
    }
  }

  if (generation.mode === "image" && generation.sourcePath) {
    try {
      const { extractDominantPalette } = await import("./image-processing");
      const extracted = await extractDominantPalette(await storageBuffer(generation.sourcePath), 5);
      if (extracted.length >= 3) paletteOptions[0] = { ...paletteOptions[0], colors: extracted };
    } catch (error) {
      console.error("Photo palette extraction failed", error);
    }
  }

  await cradler
    .from<Generation>(TABLES.generations)
    .update({ status: "completed", resultPath: path, paletteOptionsJson: JSON.stringify(paletteOptions) })
    .eq("id", generation.id);
}

/** Marks a run failed and hands back whatever it cost — failures are never billed. */
export async function failGeneration(generation: Generation, reason: string): Promise<void> {
  if (generation.status === "failed") return;

  await cradler
    .from<Generation>(TABLES.generations)
    .update({ status: "failed", failMsg: reason })
    .eq("id", generation.id);

  if (generation.userId && generation.creditsSpent > 0) {
    await refundCredits(generation.userId, generation.creditsSpent, generation.id);
  } else if (!generation.userId) {
    await releaseFreeGeneration(generation.deviceId);
  }
}

/**
 * Pulls the current state from the provider and settles the row.
 *
 * The webhook is the fast path in production, but it cannot reach localhost —
 * and a webhook can always be dropped. Polling this on read keeps both cases
 * correct without a background worker.
 */
export async function reconcileGeneration(generation: Generation): Promise<Generation> {
  if (generation.status === "completed" || generation.status === "failed") return generation;
  if (!generation.taskId) return generation;

  try {
    const task = await getTask(generation.taskId);

    if (task.state === "completed") {
      await completeGeneration(generation, task.resultUrls ?? []);
    } else if (task.state === "failed") {
      await failGeneration(generation, task.failMsg ?? "Generation failed.");
    } else {
      return generation;
    }
  } catch {
    // A transient provider error should not settle the row — try again next poll.
    return generation;
  }

  return (await getGeneration(generation.id)) ?? generation;
}
