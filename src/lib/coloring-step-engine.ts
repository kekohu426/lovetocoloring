import sharp from "sharp";

export interface ColoringRegion {
  id: number;
  area: number;
  changedArea: number;
  stage: number;
  colors: string[];
}

export interface RegionGuideStage {
  stage: number;
  regionIds: number[];
  addedPixelRatio: number;
  colors: string[];
}

export interface RegionGuideResult {
  final: Buffer;
  steps: Buffer[];
  focusSteps: Buffer[];
  regions: ColoringRegion[];
  stages: RegionGuideStage[];
  enclosedPixelRatio: number;
}

interface RegionDetection {
  labels: Int32Array;
  regions: Array<{ id: number; area: number }>;
  walls: Uint8Array;
  exterior: Uint8Array;
  enclosedPixels: number;
}

function detectRegions(line: Buffer, width: number, height: number): RegionDetection {
  const pixels = width * height;
  const barrier = new Uint8Array(pixels);

  for (let pixel = 0; pixel < pixels; pixel += 1) {
    const offset = pixel * 4;
    const luminance = .2126 * line[offset] + .7152 * line[offset + 1] + .0722 * line[offset + 2];
    if (line[offset + 3] > 24 && luminance < 205) barrier[pixel] = 1;
  }

  // Close common anti-aliased one-pixel gaps before determining the page exterior.
  const walls = new Uint8Array(barrier);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      if (
        !barrier[pixel]
        && (barrier[pixel - 1] || barrier[pixel + 1] || barrier[pixel - width] || barrier[pixel + width])
      ) {
        walls[pixel] = 1;
      }
    }
  }

  const exterior = new Uint8Array(pixels);
  const queue = new Int32Array(pixels);
  let head = 0;
  let tail = 0;
  const pushExterior = (pixel: number) => {
    if (!walls[pixel] && !exterior[pixel]) {
      exterior[pixel] = 1;
      queue[tail] = pixel;
      tail += 1;
    }
  };

  for (let index = 0; index < width; index += 1) {
    pushExterior(index);
    pushExterior((height - 1) * width + index);
  }
  for (let index = 0; index < height; index += 1) {
    pushExterior(index * width);
    pushExterior(index * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) pushExterior(pixel - 1);
    if (x < width - 1) pushExterior(pixel + 1);
    if (y > 0) pushExterior(pixel - width);
    if (y < height - 1) pushExterior(pixel + width);
  }

  const labels = new Int32Array(pixels);
  labels.fill(-1);
  const regions: Array<{ id: number; area: number }> = [];
  let enclosedPixels = 0;

  for (let start = 0; start < pixels; start += 1) {
    if (walls[start] || exterior[start] || labels[start] !== -1) continue;
    const id = regions.length;
    head = 0;
    tail = 0;
    labels[start] = id;
    queue[tail] = start;
    tail += 1;

    while (head < tail) {
      const pixel = queue[head];
      head += 1;
      enclosedPixels += 1;
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      const visit = (neighbor: number) => {
        if (!walls[neighbor] && !exterior[neighbor] && labels[neighbor] === -1) {
          labels[neighbor] = id;
          queue[tail] = neighbor;
          tail += 1;
        }
      };
      if (x > 0) visit(pixel - 1);
      if (x < width - 1) visit(pixel + 1);
      if (y > 0) visit(pixel - width);
      if (y < height - 1) visit(pixel + width);
    }

    regions.push({ id, area: tail });
  }

  return { labels, regions, walls, exterior, enclosedPixels };
}

function colorRgb(value: string): [number, number, number] {
  return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16)) as [number, number, number];
}

function colorDistance(a: readonly number[], b: readonly number[]) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

function averageRegionColor(color: Buffer, labels: Int32Array, regionId: number): [number, number, number] {
  let count = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let pixel = 0; pixel < labels.length; pixel += 1) {
    if (labels[pixel] !== regionId) continue;
    const offset = pixel * 4;
    r += color[offset];
    g += color[offset + 1];
    b += color[offset + 2];
    count += 1;
  }
  return count ? [r / count, g / count, b / count] : [255, 255, 255];
}

function assignPaletteColors(
  regions: Array<{ id: number; changedArea: number }>,
  color: Buffer,
  labels: Int32Array,
  paletteColors: string[],
) {
  const swatches = paletteColors.map((value) => ({ value: value.toUpperCase(), rgb: colorRgb(value) }));
  const ordered = [...regions].sort((a, b) => b.changedArea - a.changedArea);
  const unused = new Set(swatches.map((_, index) => index));
  const assignments = new Map<number, { value: string; rgb: [number, number, number] }>();

  for (const [position, region] of ordered.entries()) {
    const average = averageRegionColor(color, labels, region.id);
    const candidates = position < Math.min(ordered.length, swatches.length) && unused.size
      ? [...unused]
      : swatches.map((_, index) => index);
    let nearest = candidates[0] ?? 0;
    for (const index of candidates.slice(1)) {
      if (colorDistance(average, swatches[index].rgb) < colorDistance(average, swatches[nearest].rgb)) nearest = index;
    }
    assignments.set(region.id, swatches[nearest]);
    unused.delete(nearest);
  }

  return assignments;
}

function assignStages(
  regions: Array<{ id: number; area: number; changedArea: number }>,
): Array<{ id: number; area: number; changedArea: number; stage: number }> {
  const ordered = [...regions].sort((a, b) => b.changedArea - a.changedArea);
  const total = ordered.reduce((sum, region) => sum + region.changedArea, 0);
  let cumulative = 0;
  return ordered.map((region, index) => {
    const midpoint = cumulative + region.changedArea / 2;
    const areaStage = Math.min(4, Math.floor((midpoint / Math.max(1, total)) * 4) + 1);
    let stage = Math.min(4, index + 1);
    if (ordered.length >= 4) {
      const lower = Math.max(1, 4 - (ordered.length - index - 1));
      const upper = Math.min(4, index + 1);
      stage = Math.max(lower, Math.min(upper, areaStage));
    }
    cumulative += region.changedArea;
    return { ...region, stage };
  });
}

export async function createRegionGuideSteps(
  lineInput: Buffer,
  colorInput: Buffer,
  paletteColors: string[],
): Promise<RegionGuideResult | null> {
  const meta = await sharp(colorInput).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;
  const [line, color] = await Promise.all([
    sharp(lineInput).resize(width, height, { fit: "fill" }).ensureAlpha().raw().toBuffer(),
    sharp(colorInput).resize(width, height, { fit: "fill" }).ensureAlpha().raw().toBuffer(),
  ]);
  const detection = detectRegions(line, width, height);
  const minimumArea = Math.max(12, Math.floor(width * height * .00002));
  const changedByRegion = new Int32Array(detection.regions.length);
  for (let pixel = 0; pixel < detection.labels.length; pixel += 1) {
    const regionId = detection.labels[pixel];
    if (regionId < 0) continue;
    const offset = pixel * 4;
    const difference = Math.abs(color[offset] - line[offset])
      + Math.abs(color[offset + 1] - line[offset + 1])
      + Math.abs(color[offset + 2] - line[offset + 2]);
    if (difference > 42) changedByRegion[regionId] += 1;
  }
  const staged = assignStages(detection.regions
    .map((region) => ({ ...region, changedArea: changedByRegion[region.id] }))
    .filter((region) => region.area >= minimumArea && region.changedArea >= Math.max(8, region.area * .02)));
  const enclosedPixelRatio = detection.enclosedPixels / (width * height);

  if (!staged.length || enclosedPixelRatio < .01 || paletteColors.length < 2) return null;

  const paletteAssignments = assignPaletteColors(staged, color, detection.labels, paletteColors);
  const accepted: ColoringRegion[] = staged.map((region) => ({
    ...region,
    colors: [paletteAssignments.get(region.id)!.value],
  }));

  const stagesByRegion = new Int8Array(detection.regions.length);
  for (const region of accepted) stagesByRegion[region.id] = region.stage;

  const normalizedFinal = Buffer.from(line);
  for (let pixel = 0; pixel < detection.labels.length; pixel += 1) {
    const regionId = detection.labels[pixel];
    const assignment = regionId >= 0 ? paletteAssignments.get(regionId) : null;
    if (!assignment) continue;
    const offset = pixel * 4;
    normalizedFinal[offset] = assignment.rgb[0];
    normalizedFinal[offset + 1] = assignment.rgb[1];
    normalizedFinal[offset + 2] = assignment.rgb[2];
    normalizedFinal[offset + 3] = 255;
  }
  for (let pixel = 0; pixel < detection.walls.length; pixel += 1) {
    if (!detection.walls[pixel]) continue;
    const offset = pixel * 4;
    normalizedFinal[offset] = line[offset];
    normalizedFinal[offset + 1] = line[offset + 1];
    normalizedFinal[offset + 2] = line[offset + 2];
    normalizedFinal[offset + 3] = line[offset + 3];
  }

  const steps: Buffer[] = [];
  const focusSteps: Buffer[] = [];
  const stageMetadata: RegionGuideStage[] = [];
  for (let stage = 1; stage <= 4; stage += 1) {
    const cumulative = Buffer.from(line);
    const focus = Buffer.from(line);
    const stageRegionIds = new Set(accepted.filter((region) => region.stage === stage).map((region) => region.id));
    for (let pixel = 0; pixel < detection.labels.length; pixel += 1) {
      const regionId = detection.labels[pixel];
      if (regionId < 0 || !stagesByRegion[regionId]) continue;
      const offset = pixel * 4;
      if (stagesByRegion[regionId] <= stage) {
        cumulative[offset] = normalizedFinal[offset];
        cumulative[offset + 1] = normalizedFinal[offset + 1];
        cumulative[offset + 2] = normalizedFinal[offset + 2];
        cumulative[offset + 3] = normalizedFinal[offset + 3];
      }
      if (stagesByRegion[regionId] === stage) {
        focus[offset] = normalizedFinal[offset];
        focus[offset + 1] = normalizedFinal[offset + 1];
        focus[offset + 2] = normalizedFinal[offset + 2];
        focus[offset + 3] = normalizedFinal[offset + 3];
      }
    }

    // Keep one stable outline layer across the cumulative and focus views.
    for (let pixel = 0; pixel < detection.walls.length; pixel += 1) {
      if (!detection.walls[pixel]) continue;
      const offset = pixel * 4;
      for (const output of [cumulative, focus]) {
        output[offset] = line[offset];
        output[offset + 1] = line[offset + 1];
        output[offset + 2] = line[offset + 2];
        output[offset + 3] = line[offset + 3];
      }
    }
    steps.push(await sharp(cumulative, { raw: { width, height, channels: 4 } }).png().toBuffer());
    focusSteps.push(await sharp(focus, { raw: { width, height, channels: 4 } }).png().toBuffer());
    const addedArea = accepted
      .filter((region) => region.stage === stage)
      .reduce((sum, region) => sum + region.changedArea, 0);
    stageMetadata.push({
      stage,
      regionIds: [...stageRegionIds],
      addedPixelRatio: addedArea / (width * height),
      colors: [...new Set(
        accepted
          .filter((region) => region.stage === stage)
          .flatMap((region) => region.colors),
      )],
    });
  }

  const final = await sharp(normalizedFinal, { raw: { width, height, channels: 4 } }).png().toBuffer();
  steps[3] = final;
  return { final, steps, focusSteps, regions: accepted, stages: stageMetadata, enclosedPixelRatio };
}
