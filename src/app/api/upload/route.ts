import { NextResponse } from "next/server";
import { CradlerError } from "@cradler/sdk";
import { cradler } from "@/lib/cradler";
import { retryTransient } from "@/lib/retry";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function logUploadError(error: unknown) {
  if (error instanceof CradlerError) {
    console.error("Cradler source upload failed", {
      status: error.status,
      code: error.code,
      message: error.message,
    });
    return;
  }

  console.error("Cradler source upload failed", {
    message: error instanceof Error ? error.message : String(error),
  });
}

/**
 * Stores a source photo so the image model can fetch it by URL.
 *
 * Uploads are public because grok pulls `image_url` over the open internet — a
 * signed URL would expire mid-task. The path is random, so the file is not
 * discoverable without the generation record.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That image is larger than 10 MB." }, { status: 413 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Upload a JPG, PNG or WebP image." }, { status: 415 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `sources/${crypto.randomUUID()}.${ext}`;

  try {
    const { path, publicUrl } = await retryTransient(async () => {
      try {
        return await cradler.storage.upload(key, file, { public: true });
      } catch (error) {
        logUploadError(error);
        throw error;
      }
    });
    const url = publicUrl ?? (await cradler.storage.getPublicUrl(path));
    return NextResponse.json({ path, url });
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
}
