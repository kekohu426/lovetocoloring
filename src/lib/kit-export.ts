export type ExportAsset = "line" | "final" | "steps" | "swatch";
export type ExportFormat = "pdf-pack" | "zip" | "guide-pdf";
export interface StoredStepPaths {
  results: string[];
  focus: string[];
}

const ASSETS: readonly ExportAsset[] = ["line", "final", "steps", "swatch"];

export function parseExportSelection(value: string | null | undefined): ExportAsset[] {
  const requested = (value ?? "line,final,steps,swatch").split(",");
  return ASSETS.filter((asset) => requested.includes(asset));
}

export function parseExportFormat(value: string | null | undefined): ExportFormat {
  return value === "zip" || value === "guide-pdf" ? value : "pdf-pack";
}

export function exportFilename(format: ExportFormat): string {
  if (format === "zip") return "magic-coloring-kit.zip";
  if (format === "guide-pdf") return "magic-coloring-guide.pdf";
  return "magic-coloring-kit.pdf";
}

function stringPaths(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

export function parseStoredStepPaths(value: string | null | undefined): StoredStepPaths {
  try {
    const parsed: unknown = JSON.parse(value ?? "[]");
    if (Array.isArray(parsed)) {
      return { results: stringPaths(parsed), focus: [] };
    }
    if (!parsed || typeof parsed !== "object") {
      return { results: [], focus: [] };
    }
    const stored = parsed as Record<string, unknown>;
    return {
      results: stringPaths(stored.results),
      focus: stringPaths(stored.focus),
    };
  } catch {
    return { results: [], focus: [] };
  }
}
