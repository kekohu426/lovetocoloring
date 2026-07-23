"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  ImagePlus,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import type { PaletteOption } from "@/lib/palettes";
import { notifyCreditBalanceChanged } from "./CreditBalance";

function paletteDescription(name: string) {
  const value = name.toLowerCase();
  if (value.includes("original") || value.includes("photo")) return "Inspired by your photo";
  if (value.includes("happy") || value.includes("primary") || value.includes("bright")) return "Cheerful and bright";
  if (value.includes("candy") || value.includes("celebration")) return "Soft and sweet";
  if (value.includes("ocean") || value.includes("pop") || value.includes("party")) return "Energetic and fun";
  if (value.includes("pastel") || value.includes("calm") || value.includes("quiet")) return "Calm and soothing";
  if (value.includes("forest") || value.includes("nature") || value.includes("earth")) return "Natural and grounded";
  if (value.includes("warm") || value.includes("golden")) return "Warm and natural";
  if (value.includes("jewel") || value.includes("fantasy")) return "Rich and imaginative";
  return "Balanced and coordinated";
}

export function PaletteStudio({ generationId, mode, lineUrl, palettes, signedIn, credits, unlimited, existing, downloadHref }: {
  generationId: string;
  mode: "text" | "image";
  lineUrl: string;
  palettes: PaletteOption[];
  signedIn: boolean;
  credits: number;
  unlimited: boolean;
  existing: Record<string, string>;
  downloadHref: string;
}) {
  const [selected, setSelected] = useState(palettes[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCredits, setAvailableCredits] = useState(credits);
  const active = palettes.find((item) => item.id === selected) ?? palettes[0];
  const hasExistingGuide = Boolean(existing[selected]);
  const canCreate = unlimited || availableCredits >= 1;
  const createHref = mode === "image" ? "/photo-to-coloring-page" : "/text-to-coloring-page";

  async function createKit() {
    if (!signedIn) {
      await signIn("google", { callbackUrl: window.location.href });
      return;
    }
    if (existing[selected]) {
      window.location.href = `/kits/${existing[selected]}`;
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/generations/${generationId}/kits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paletteId: selected, clientRequestId: crypto.randomUUID() }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402) {
          setAvailableCredits(typeof data.balance === "number" ? data.balance : 0);
          notifyCreditBalanceChanged();
        }
        throw new Error(data.error ?? "Could not create the coloring kit.");
      }
      notifyCreditBalanceChanged();
      window.location.href = `/kits/${data.id}`;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the coloring kit.");
      setBusy(false);
    }
  }

  const actionLabel = hasExistingGuide
    ? "Open Color guide"
    : signedIn
      ? "Continue to Color guide · 1 credit"
      : "Sign in to continue";

  return <section className="wizard-workbench palette-workbench page-frame">
    <aside className="wizard-controls palette-controls">
      <div className="wizard-stage-copy palette-stage-copy">
        <span>STEP 2 OF 4</span>
        <h2>Choose a color palette</h2>
        <p>Pick a ready-made palette for your finished coloring reference and four-step guide.</p>
      </div>

      <div className="palette-mode-tabs" role="tablist" aria-label="Palette type">
        <button type="button" className="selected" role="tab" aria-selected="true">Recommended palettes</button>
        <button type="button" role="tab" aria-selected="false" disabled title="Custom palettes are coming soon">Custom palette</button>
      </div>

      <div className="palette-list palette-choice-grid">
        {palettes.map((palette) => <button
          key={palette.id}
          type="button"
          className={selected === palette.id ? "selected" : ""}
          onClick={() => setSelected(palette.id)}
          aria-pressed={selected === palette.id}
        >
          <div className="palette-swatches">
            {palette.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
          </div>
          {selected === palette.id ? <span className="palette-selected-mark" aria-hidden="true"><Check size={13} strokeWidth={3} /></span> : null}
          <span>
            <strong>{palette.name}</strong>
            <small>{existing[palette.id] ? "Color guide ready" : paletteDescription(palette.name)}</small>
          </span>
        </button>)}
      </div>

      <div className="palette-tip">
        <Lightbulb size={21} aria-hidden="true" />
        <div><b>Tip</b><p>Compare the color moods beside your line art before creating the finished guide.</p></div>
      </div>

      <div className="palette-footer-actions">
        <Link className="palette-back-action" href={createHref}><ArrowLeft size={18} />Back</Link>
        {signedIn && !hasExistingGuide && !canCreate
          ? <Link className="primary-action" href="/pricing"><Sparkles size={18} />Get credits to continue<ArrowRight size={18} /></Link>
          : <button type="button" className="primary-action" disabled={busy} onClick={createKit}>
            {busy ? <LoaderCircle className="spin" size={18} /> : signedIn ? <Sparkles size={18} /> : <LockKeyhole size={18} />}
            {actionLabel}
            {!busy ? <ArrowRight size={18} /> : null}
          </button>}
      </div>
      {signedIn && !unlimited ? <small className="credit-balance-note">Available balance: {availableCredits} credit{availableCredits === 1 ? "" : "s"}</small> : null}
      {error ? <div className="inline-error">{error}</div> : null}
    </aside>

    <article className="wizard-preview palette-live-preview">
      <div className="palette-preview-heading">
        <div>
          <h2>Palette preview</h2>
          <p>Compare the selected colors with your coloring page.</p>
        </div>
        <div className="palette-preview-actions">
          <a href={downloadHref} download title="Download blank line art" aria-label="Download blank line art"><Download size={18} /></a>
          <Link href={createHref}><ImagePlus size={18} />Change line art</Link>
        </div>
      </div>

      <div className="persistent-paper palette-paper">
        <img src={lineUrl} alt="Generated blank coloring page" />
      </div>

      <div className="current-palette-preview">
        <b>Current palette · {active?.name}</b>
        <div className="preview-palette-strip">
          {active?.colors.map((color) => <span key={color} style={{ backgroundColor: color }} title={color} />)}
        </div>
        <small>These colors will guide the finished reference and four coloring passes.</small>
      </div>
    </article>
  </section>;
}
