export type GeneratorMode = "text" | "image";

export function generatorHref(homePath: string, mode: GeneratorMode): string {
  const root = homePath.endsWith("/") ? homePath : `${homePath}/`;
  const slug = mode === "image" ? "photo-to-coloring-page" : "text-to-coloring-page";
  return `${root}${slug}`;
}

export function generatorMode(value: unknown): GeneratorMode {
  return value === "image" ? "image" : "text";
}
