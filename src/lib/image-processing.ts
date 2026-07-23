import sharp from "sharp";
import type { GuideDifficulty } from "./scenarios";
import type { PaletteOption } from "./palettes";
import { createRegionGuideSteps } from "./coloring-step-engine.ts";
import type { ColoringGuideDocument } from "./types";

function hex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function rgb(value: string): [number, number, number] {
  return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16)) as [number, number, number];
}

export async function extractDominantPalette(input: Buffer, count = 5): Promise<string[]> {
  const { data, info } = await sharp(input).resize({ width: 96, height: 96, fit: "inside", withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 242 && g > 242 && b > 242) continue;
    if (r < 18 && g < 18 && b < 18) continue;
    const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
    const item = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    item.count += 1; item.r += r; item.g += g; item.b += b;
    buckets.set(key, item);
  }

  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map((item) => hex(item.r / item.count, item.g / item.count, item.b / item.count));
}

export function guideCopy(difficulty: GuideDifficulty, palette?: PaletteOption): [string, string, string, string] {
  if (palette?.colors.length) {
    const colors = palette.colors;
    const pick = (index: number) => colors[index % colors.length];
    return [
      `Fill the background and largest open shapes with ${pick(0)} and ${pick(1)}`,
      `Color the main subject base regions with ${pick(2)}`,
      `Add clothing, fur, objects and supporting shapes with ${pick(3)}`,
      `Finish small details with ${pick(4)} and restore crisp black outlines`,
    ];
  }
  if (difficulty === "advanced") {
    return ["Lay in the light base tones", "Build the main color families", "Layer shadows and secondary details", "Finish accents and strengthen contrast"];
  }
  if (difficulty === "guided") {
    return ["Start with the light background colors", "Color the main subject", "Add the supporting shapes", "Finish small accents and outlines"];
  }
  return ["Start with the lightest colors", "Fill the main character", "Color the larger details", "Add the final bright accents"];
}

export interface ColorCoverage {
  fillablePixels: number;
  coloredPixels: number;
  ratio: number;
}

export interface GuidePackage {
  final: Buffer;
  steps: Buffer[];
  focusSteps: Buffer[];
  guide: ColoringGuideDocument;
  engine: "region-v3" | "palette-fallback";
  quality: {
    regionCount: number;
    enclosedPixelRatio: number;
  };
}

/** Measures color inside regions enclosed by the original line art, excluding the page background. */
export async function measureColorCoverage(lineInput: Buffer, colorInput: Buffer): Promise<ColorCoverage> {
  const size = 256;
  const [line, color] = await Promise.all([
    sharp(lineInput).resize(size, size, { fit: "fill" }).removeAlpha().raw().toBuffer(),
    sharp(colorInput).resize(size, size, { fit: "fill" }).removeAlpha().raw().toBuffer(),
  ]);
  const pixels = size * size;
  const barrier = new Uint8Array(pixels);

  for (let pixel = 0; pixel < pixels; pixel += 1) {
    const offset = pixel * 3;
    const luminance = .2126 * line[offset] + .7152 * line[offset + 1] + .0722 * line[offset + 2];
    if (luminance < 205) barrier[pixel] = 1;
  }

  // A one-pixel dilation closes anti-aliased gaps before the exterior flood fill.
  const walls = new Uint8Array(barrier);
  for (let y = 1; y < size - 1; y += 1) {
    for (let x = 1; x < size - 1; x += 1) {
      const pixel = y * size + x;
      if (!barrier[pixel] && (barrier[pixel - 1] || barrier[pixel + 1] || barrier[pixel - size] || barrier[pixel + size])) walls[pixel] = 1;
    }
  }

  const exterior = new Uint8Array(pixels);
  const queue = new Int32Array(pixels);
  let head = 0;
  let tail = 0;
  const push = (pixel: number) => {
    if (!walls[pixel] && !exterior[pixel]) {
      exterior[pixel] = 1;
      queue[tail] = pixel;
      tail += 1;
    }
  };
  for (let index = 0; index < size; index += 1) {
    push(index);
    push((size - 1) * size + index);
    push(index * size);
    push(index * size + size - 1);
  }
  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % size;
    const y = Math.floor(pixel / size);
    if (x > 0) push(pixel - 1);
    if (x < size - 1) push(pixel + 1);
    if (y > 0) push(pixel - size);
    if (y < size - 1) push(pixel + size);
  }

  let fillablePixels = 0;
  let coloredPixels = 0;
  for (let pixel = 0; pixel < pixels; pixel += 1) {
    if (walls[pixel] || exterior[pixel]) continue;
    fillablePixels += 1;
    const offset = pixel * 3;
    const r = color[offset], g = color[offset + 1], b = color[offset + 2];
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const average = (r + g + b) / 3;
    if ((chroma > 10 && average < 248) || average < 228) coloredPixels += 1;
  }

  return {
    fillablePixels,
    coloredPixels,
    ratio: fillablePixels ? coloredPixels / fillablePixels : 1,
  };
}

function distance(a: [number, number, number], b: [number, number, number]) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

async function createPaletteFallbackSteps(lineInput: Buffer, colorInput: Buffer, palette: PaletteOption): Promise<Buffer[]> {
  const meta = await sharp(colorInput).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;
  const color = await sharp(colorInput).resize(width, height).ensureAlpha().raw().toBuffer();
  const line = await sharp(lineInput).resize(width, height).ensureAlpha().raw().toBuffer();
  const swatches = palette.colors.map(rgb);

  return Promise.all([1, 2, 3, 4].map(async (stage) => {
    if (stage === 4) return sharp(colorInput).resize(width, height).png().toBuffer();
    const output = Buffer.from(line);
    const visible = Math.ceil((swatches.length * stage) / 4);
    for (let i = 0; i < color.length; i += 4) {
      const pixel: [number, number, number] = [color[i], color[i + 1], color[i + 2]];
      if (pixel[0] > 245 && pixel[1] > 245 && pixel[2] > 245) continue;
      // Preserve the original line layer instead of copying model-redrawn outlines.
      if (Math.max(pixel[0], pixel[1], pixel[2]) < 150) continue;
      let nearest = 0;
      for (let p = 1; p < swatches.length; p += 1) {
        if (distance(pixel, swatches[p]) < distance(pixel, swatches[nearest])) nearest = p;
      }
      if (nearest < visible) {
        output[i] = color[i]; output[i + 1] = color[i + 1]; output[i + 2] = color[i + 2]; output[i + 3] = color[i + 3];
      }
    }
    return sharp(output, { raw: { width, height, channels: 4 } }).png().toBuffer();
  }));
}

function regionGuideCopy(): [string, string, string, string] {
  return [
    "Start with the largest enclosed coloring areas",
    "Continue with the next broad regions while keeping the outlines clear",
    "Add the medium regions and supporting details",
    "Finish the smallest accents and compare with the completed reference",
  ];
}

const regionTitles = [
  "Color the broadest areas first",
  "Add the next large color regions",
  "Color the supporting shapes and details",
  "Finish the smallest remaining accents",
] as const;

function regionGuideDocument(regionResult: Awaited<ReturnType<typeof createRegionGuideSteps>>): ColoringGuideDocument {
  if (!regionResult) throw new Error("Region guide data is unavailable.");
  return {
    version: 3,
    engine: "region-v3",
    steps: regionResult.stages.map((stage, index) => ({
      title: regionTitles[index],
      colors: stage.colors,
      regionCount: stage.regionIds.length,
      addedPixelRatio: stage.addedPixelRatio,
      hints: [
        `Color ${stage.regionIds.length} complete ${stage.regionIds.length === 1 ? "region" : "regions"} in this pass`,
        "Fill each outlined area evenly",
        index === 3 ? "Compare the cumulative result with the finished reference" : "Leave later regions blank for now",
      ],
    })),
  };
}

export async function createGuidePackage(
  lineInput: Buffer,
  colorInput: Buffer,
  palette: PaletteOption,
  difficulty: GuideDifficulty = "guided",
): Promise<GuidePackage> {
  try {
    const regionResult = await createRegionGuideSteps(lineInput, colorInput, palette.colors);
    if (regionResult) {
      return {
        final: regionResult.final,
        steps: regionResult.steps,
        focusSteps: regionResult.focusSteps,
        guide: regionGuideDocument(regionResult),
        engine: "region-v3",
        quality: {
          regionCount: regionResult.regions.length,
          enclosedPixelRatio: regionResult.enclosedPixelRatio,
        },
      };
    }
  } catch (error) {
    // Dense pages or missing native sharp binaries should still produce a usable kit.
    console.error("Region guide engine failed; using palette fallback", error);
  }

  const fallbackSteps = await createPaletteFallbackSteps(lineInput, colorInput, palette);
  return {
    final: fallbackSteps[3],
    steps: fallbackSteps,
    focusSteps: fallbackSteps,
    guide: {
      version: 3,
      engine: "palette-fallback",
      steps: guideCopy(difficulty, palette).map((title, index) => ({
        title,
        colors: index === 0 ? palette.colors.slice(0, 2) : [palette.colors[Math.min(index + 1, palette.colors.length - 1)]],
        regionCount: 0,
        addedPixelRatio: 0,
        hints: ["Follow the visible color change", "Keep the outlines clear", "Compare with the finished reference"],
      })),
    },
    engine: "palette-fallback",
    quality: { regionCount: 0, enclosedPixelRatio: 0 },
  };
}

export async function createGuideSteps(lineInput: Buffer, colorInput: Buffer, palette: PaletteOption): Promise<Buffer[]> {
  return (await createGuidePackage(lineInput, colorInput, palette)).steps;
}

function xml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

export async function createSwatchImage(palette: PaletteOption): Promise<Buffer> {
  const cells = palette.colors.map((color, index) => `<rect x="${48 + index * 136}" y="92" width="112" height="112" rx="12" fill="${color}"/><text x="${104 + index * 136}" y="232" text-anchor="middle" font-size="18" fill="#56575d">${color}</text>`).join("");
  const svg = `<svg width="800" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="300" fill="#fff"/><text x="48" y="52" font-family="sans-serif" font-size="28" font-weight="700" fill="#1c1d21">${xml(palette.name)}</text>${cells}</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function overlayBirthdayTitle(input: Buffer, name: string, age: string): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  const width = meta.width ?? 1024;
  const title = `${name}'s ${age}th Birthday`;
  const svg = `<svg width="${width}" height="180" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="150" fill="white" fill-opacity=".92"/><text x="50%" y="92" text-anchor="middle" font-family="sans-serif" font-size="46" font-weight="700" fill="#111">${xml(title)}</text></svg>`;
  return sharp(input).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer();
}
