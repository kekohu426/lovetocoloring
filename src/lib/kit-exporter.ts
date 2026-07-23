import "server-only";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import { getGeneration } from "./generations";
import { createSwatchImage } from "./image-processing";
import { parseStoredStepPaths, type ExportAsset, type ExportFormat } from "./kit-export";
import { parsePaletteJson } from "./palettes";
import { storageBuffer } from "./storage";
import type { ColoringKit } from "./types";
import type { ColoringGuideDocument } from "./types";

interface KitAssets {
  line: Buffer;
  final: Buffer;
  steps: Buffer[];
  swatch: Buffer;
  guide: ColoringGuideDocument;
}

async function loadAssets(kit: ColoringKit): Promise<KitAssets> {
  const generation = await getGeneration(kit.generationId);
  const palette = parsePaletteJson(kit.paletteJson);
  if (!generation?.resultPath || !kit.coloredPath || !palette) throw new Error("Kit assets are incomplete.");
  const stepPaths = parseStoredStepPaths(kit.stepPathsJson).results;
  return {
    line: await storageBuffer(generation.resultPath),
    final: await storageBuffer(kit.coloredPath),
    steps: await Promise.all(stepPaths.map(storageBuffer)),
    swatch: await createSwatchImage(palette),
    guide: kit.guideJson ? JSON.parse(kit.guideJson) : { version: 3, engine: "palette-fallback", steps: [] },
  };
}

async function png(input: Buffer) {
  return sharp(input).png().toBuffer();
}

async function addImagePage(pdf: PDFDocument, input: Buffer, title: string) {
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  page.drawText(title, { x: 42, y: 800, size: 18, font, color: rgb(0.1, 0.1, 0.12) });
  const image = await pdf.embedPng(await png(input));
  const scale = Math.min(511 / image.width, 716 / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  page.drawImage(image, { x: (595.28 - width) / 2, y: 55 + (716 - height) / 2, width, height });
}

async function buildPdf(assets: KitAssets, selection: ExportAsset[], guideOnly: boolean) {
  const pdf = await PDFDocument.create();
  if (!guideOnly && selection.includes("line")) await addImagePage(pdf, assets.line, "Blank line art");
  if (selection.includes("final")) await addImagePage(pdf, assets.final, "Finished color reference");
  if (selection.includes("steps")) {
    for (let index = 0; index < assets.steps.length; index += 1) {
      await addImagePage(pdf, assets.steps[index], `Step ${index + 1}: ${assets.guide.steps[index]?.title ?? "Add the next colors"}`);
    }
  }
  if (selection.includes("swatch")) await addImagePage(pdf, assets.swatch, "Color swatch reference");
  if (pdf.getPageCount() === 0) await addImagePage(pdf, assets.final, "Finished color reference");
  return Buffer.from(await pdf.save());
}

export async function buildKitExport(kit: ColoringKit, format: ExportFormat, selection: ExportAsset[]): Promise<{ body: Buffer; type: string }> {
  const assets = await loadAssets(kit);
  if (format !== "zip") {
    return { body: await buildPdf(assets, selection, format === "guide-pdf"), type: "application/pdf" };
  }

  const zip = new JSZip();
  if (selection.includes("line")) zip.file("blank-line-art.png", await png(assets.line));
  if (selection.includes("final")) zip.file("finished-color-reference.png", await png(assets.final));
  if (selection.includes("steps")) assets.steps.forEach((step, index) => zip.file(`step-${index + 1}.png`, step));
  if (selection.includes("swatch")) zip.file("color-swatches.png", assets.swatch);
  zip.file("coloring-guide.pdf", await buildPdf(assets, ["final", "steps", "swatch"], true));
  return { body: await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }), type: "application/zip" };
}
