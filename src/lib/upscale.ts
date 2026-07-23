import "server-only";
import { createUpscaleTask, getTask } from "./imagegen";

const POLL_INTERVAL_MS = 2_000;
const MAX_WAIT_MS = 50_000;

export type UpscaleResult = { url: string } | { pending: true; taskId: string };

export function upscaleConfigured(): boolean {
  return Boolean(process.env.APIMODELS_API_KEY);
}

export async function runUpscale(imageUrl: string, scale: 2 | 4 = 2): Promise<UpscaleResult> {
  if (!upscaleConfigured()) {
    throw new Error("HD upscaling is not configured: set APIMODELS_API_KEY.");
  }

  const { taskId } = await createUpscaleTask({ imageUrl, scale });
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    const task = await getTask(taskId);
    if (task.state === "completed") {
      const url = task.resultUrls?.[0];
      if (!url) throw new Error("The upscale provider returned no image.");
      return { url };
    }
    if (task.state === "failed") {
      throw new Error(task.failMsg ?? "The upscale task failed.");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`The upscale task timed out (${taskId}).`);
}
