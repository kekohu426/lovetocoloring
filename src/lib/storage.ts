import "server-only";
import { cradler } from "./cradler";
import { retryTransient } from "./retry";

/**
 * apimodels.app deletes generated images after 7 days, so every finished result
 * is copied into Cradler's public bucket immediately. The stored path — not the
 * upstream URL — is what we persist on the generation row.
 */
export async function mirrorToStorage(sourceUrl: string, destPath: string): Promise<string> {
  const res = await retryTransient(async () => {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not download result image (${response.status})`);
    return response;
  });

  const blob = await res.blob();
  const { path } = await retryTransient(() => cradler.storage.upload(destPath, blob, { public: true }));
  return path;
}

export async function uploadBuffer(buffer: Buffer, destPath: string, type = "image/png"): Promise<string> {
  const blob = new Blob([new Uint8Array(buffer)], { type });
  const { path } = await retryTransient(() => cradler.storage.upload(destPath, blob, { public: true }));
  return path;
}

export async function storageBuffer(path: string): Promise<Buffer> {
  const response = await retryTransient(async () => {
    const result = await fetch(await publicUrl(path), { cache: "no-store" });
    if (!result.ok) throw new Error(`Could not read stored asset (${result.status})`);
    return result;
  });
  return Buffer.from(await response.arrayBuffer());
}

export function publicUrl(path: string, opts?: { width?: number; quality?: number }) {
  return cradler.storage.getPublicUrl(path, opts);
}

/** `generations/<id>/result.png` — one folder per generation keeps cleanup simple. */
export function resultPath(generationId: string, kind: "result" | "upscaled" | "source", ext = "png") {
  return `generations/${generationId}/${kind}.${ext}`;
}

export function kitPath(kitId: string, kind: "colored" | `step-${number}` | `step-${number}-focus` | "swatch", ext = "png") {
  return `coloring-kits/${kitId}/${kind}.${ext}`;
}
