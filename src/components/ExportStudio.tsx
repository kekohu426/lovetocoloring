"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  Archive,
  Check,
  Download,
  FileText,
  Grid2X2,
  Infinity as InfinityIcon,
  MonitorSmartphone,
  Palette,
  PenLine,
  Printer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type AssetId = "line" | "final" | "steps" | "swatch";
type ExportFormat = "pdf-pack" | "zip" | "guide-pdf";

const assets: Array<{
  id: AssetId;
  label: string;
  detail: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}> = [
  { id: "line", label: "Printable line art", detail: "PNG · transparent + white background", icon: PenLine },
  { id: "final", label: "Colored reference", detail: "PNG · selected palette", icon: Palette },
  { id: "steps", label: "Step-by-step color guide", detail: "Four progressive coloring passes", icon: Sparkles },
  { id: "swatch", label: "Color swatch reference", detail: "HEX colors for easy matching", icon: Grid2X2 },
];

const formats: Array<{
  id: ExportFormat;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}> = [
  { id: "pdf-pack", label: "PDF pack", icon: FileText },
  { id: "zip", label: "ZIP images", icon: Archive },
  { id: "guide-pdf", label: "Guide PDF", icon: FileText },
];

const benefits = [
  { title: "Print-ready", detail: "High resolution · 300 DPI", icon: Printer, tone: "green" },
  { title: "Color-accurate", detail: "Optimized for best results", icon: Palette, tone: "pink" },
  { title: "Any device", detail: "Works on all printers", icon: MonitorSmartphone, tone: "blue" },
  { title: "Download anytime", detail: "From My pages", icon: InfinityIcon, tone: "yellow" },
] as const;

export function ExportStudio({
  id,
  lineUrl,
  coloredUrl,
  stepUrls,
}: {
  id: string;
  lineUrl?: string | null;
  coloredUrl?: string | null;
  stepUrls: string[];
}) {
  const [selected, setSelected] = useState<AssetId[]>(assets.map((item) => item.id));
  const [format, setFormat] = useState<ExportFormat>("pdf-pack");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const href = useMemo(
    () => `/api/kits/${id}/export?format=${format}&include=${selected.join(",")}`,
    [format, id, selected],
  );
  const previews = [lineUrl, stepUrls[1] ?? stepUrls[0] ?? coloredUrl, coloredUrl].filter(Boolean) as string[];

  function toggle(asset: AssetId) {
    setSelected((current) => current.includes(asset) ? current.filter((item) => item !== asset) : [...current, asset]);
    setDownloadError("");
  }

  async function downloadExport() {
    if (selected.length === 0 || downloading) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const response = await fetch(href);
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? "The download could not be prepared.");
      }
      const blob = await response.blob();
      const filename = format === "zip"
        ? "magic-coloring-kit.zip"
        : format === "guide-pdf"
          ? "magic-coloring-guide.pdf"
          : "magic-coloring-kit.pdf";
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "The download could not be prepared.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="export-workbench-v2 page-frame">
      <aside className="export-download-controls">
        <header className="export-stage-copy">
          <span>STEP 4</span>
          <h2>Download your files</h2>
          <p>Everything you need for the best printing results.</p>
        </header>

        <div className="export-section-heading">
          <b>Included files</b>
          <small>{selected.length} selected</small>
        </div>
        <div className="export-asset-list">
          {assets.map((asset) => {
            const Icon = asset.icon;
            const checked = selected.includes(asset.id);
            return (
              <label key={asset.id} className={checked ? "selected" : ""}>
                <input type="checkbox" checked={checked} onChange={() => toggle(asset.id)} />
                <span className="export-check" aria-hidden="true">{checked && <Check size={14} strokeWidth={3} />}</span>
                <Icon size={24} strokeWidth={1.8} />
                <span>
                  <b>{asset.label}</b>
                  <small>{asset.detail}</small>
                </span>
              </label>
            );
          })}
        </div>

        <div className="export-section-heading export-format-heading"><b>Package format</b></div>
        <div className="export-format-options" role="radiogroup" aria-label="Package format">
          {formats.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={format === option.id}
                className={format === option.id ? "active" : ""}
                onClick={() => {
                  setFormat(option.id);
                  setDownloadError("");
                }}
              >
                <Icon size={17} />
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="export-download-action"
          disabled={selected.length === 0 || downloading}
          onClick={downloadExport}
        >
          <Download size={20} />
          {downloading
            ? "Preparing your download..."
            : selected.length > 0
              ? "Download selected files"
              : "Select a file to download"}
        </button>
        {downloadError && <p className="export-download-error" role="alert">{downloadError}</p>}
        <p className="export-secure-note"><ShieldCheck size={16} />Secure download · Files are yours forever</p>
      </aside>

      <article className="export-download-preview">
        <div className="export-ready-banner">
          <span><Check size={22} strokeWidth={3} /></span>
          <p><b>All set!</b><small>Your files are bundled and ready to download.</small></p>
        </div>

        <div className="export-paper-scene" aria-label="Preview of the files in your coloring pack">
          <Sparkles className="export-spark export-spark-one" aria-hidden="true" />
          <Sparkles className="export-spark export-spark-two" aria-hidden="true" />
          {previews.slice(0, 3).map((src, index) => (
            <figure key={`${src}-${index}`} className={`export-paper export-paper-${index + 1}`}>
              <img src={src} alt={index === 0 ? "Printable line art" : index === 1 ? "Color guide preview" : "Colored reference"} />
            </figure>
          ))}
        </div>

        <div className="export-benefits">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title}>
                <span className={`export-benefit-icon ${benefit.tone}`}><Icon size={20} /></span>
                <p><b>{benefit.title}</b><small>{benefit.detail}</small></p>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
