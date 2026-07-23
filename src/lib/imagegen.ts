import "server-only";

const IMAGE_API_ROOT = "https://apimodels.app/api/v1/images";
const API_BASE = `${IMAGE_API_ROOT}/generations`;

/** Sizes both grok-4.2-image and grok-imagine-image-pro accept. */
export const SIZES = {
  portrait: "1024x1536",
  square: "1024x1024",
  landscape: "1536x1024",
} as const;

const ASPECT_RATIOS = {
  portrait: "2:3",
  square: "1:1",
  landscape: "3:2",
} as const;

export type SizeKey = keyof typeof SIZES;

export type TaskState = "pending" | "processing" | "completed" | "failed";

interface CreateTaskResult {
  taskId: string | null;
  state: TaskState;
  resultUrls?: string[];
}

interface TaskData {
  taskId: string;
  state: TaskState;
  resultUrls?: string[];
  failMsg?: string | null;
}

function apiKey(): string {
  const key = process.env.APIMODELS_API_KEY;
  if (!key) throw new Error("Missing env var: APIMODELS_API_KEY");
  return key;
}

/**
 * Creates an image request. SparkPix returns synchronously; the other models
 * return a task id and finish through a webhook or polling.
 */
export async function createTask(input: {
  model: string;
  prompt: string;
  size: SizeKey;
  /** A publicly reachable URL when editing an uploaded photo into line art. */
  imageUrl?: string;
  /** Multiple ordered references for edit models. Image 1 is always the canvas to edit. */
  imageUrls?: string[];
  callbackUrl?: string;
}): Promise<CreateTaskResult> {
  const isSparkPixText = input.model === "sparkpix-image";
  const isSparkPixEdit = input.model === "sparkpix-image-edit";
  const editImages = input.imageUrls?.filter(Boolean).length
    ? input.imageUrls.filter(Boolean)
    : input.imageUrl
      ? [input.imageUrl]
      : [];

  if (isSparkPixEdit && !editImages.length) {
    throw new Error("SparkPix Image Edit requires a public source image URL.");
  }

  const endpoint = isSparkPixText
    ? `${IMAGE_API_ROOT}/generations-sync`
    : isSparkPixEdit
      ? `${IMAGE_API_ROOT}/edit`
      : API_BASE;
  const payload = isSparkPixText
    ? {
        prompt: input.prompt,
        aspect_ratio: ASPECT_RATIOS[input.size],
      }
    : isSparkPixEdit
      ? {
          prompt: input.prompt,
          images: editImages,
          aspect_ratio: ASPECT_RATIOS[input.size],
          turbo: false,
        }
      : {
          model: input.model,
          prompt: input.prompt,
          size: SIZES[input.size],
          n: 1,
          ...(editImages[0] ? { image_url: editImages[0] } : {}),
          ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
        };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (isSparkPixText || isSparkPixEdit) {
    if (!res.ok || !body?.data?.url) {
      throw new Error(`SparkPix API rejected the image (${res.status}): ${body?.msg ?? "unknown error"}`);
    }
    return { taskId: null, state: "completed", resultUrls: [body.data.url] };
  }

  if (!res.ok || !body?.data?.taskId) {
    throw new Error(`Image API rejected the task (${res.status}): ${body?.msg ?? "unknown error"}`);
  }

  return { taskId: body.data.taskId, state: body.data.state ?? "pending" };
}

/** Starts a Real-ESRGAN upscale task for an existing public image URL. */
export async function createUpscaleTask(input: {
  imageUrl: string;
  scale: 2 | 4;
}): Promise<{ taskId: string; state: TaskState }> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "real-esrgan",
      image: input.imageUrl,
      scale: input.scale,
      face_enhance: false,
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.data?.taskId) {
    throw new Error(`Upscale API rejected the task (${res.status}): ${body?.msg ?? "unknown error"}`);
  }

  return { taskId: body.data.taskId, state: body.data.state ?? "pending" };
}

export async function getTask(taskId: string): Promise<TaskData> {
  const res = await fetch(`${API_BASE}?task_id=${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.data) {
    throw new Error(`Could not read task ${taskId} (${res.status})`);
  }
  return body.data as TaskData;
}

/**
 * The webhook ships `param` and `resultJson` as JSON *strings*, not objects.
 * Parsing them is easy to forget and fails silently, so it lives here.
 */
export function parseCallbackResult(resultJson: string | null | undefined): string[] {
  if (!resultJson) return [];
  try {
    const parsed = JSON.parse(resultJson);
    return Array.isArray(parsed?.resultUrls) ? parsed.resultUrls : [];
  } catch {
    return [];
  }
}
