export function downloadUrl(id: string): string {
  return `/api/generations/${encodeURIComponent(id)}/download`;
}

export function printUrl(id: string): string {
  return `/api/generations/${encodeURIComponent(id)}/print`;
}

export function isGenerationId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function attachmentHeaders(path: string, contentType: string, contentLength?: string | null): Headers {
  const match = /\.(png|jpe?g|webp)$/i.exec(path);
  const extension = match?.[1].toLowerCase().replace("jpeg", "jpg") ?? "png";
  const headers = new Headers({ "Content-Type": contentType });
  headers.set("Content-Disposition", `attachment; filename="coloring-page.${extension}"`);
  if (contentLength) headers.set("Content-Length", contentLength);
  return headers;
}
