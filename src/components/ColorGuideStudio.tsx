"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Layers3,
  Lightbulb,
  PaintBucket,
  Printer,
  Shirt,
  Sparkles,
} from "lucide-react";
import type { ColoringGuideDocument } from "@/lib/types";

const fallbackSteps = [
  "Start with the largest background areas.",
  "Color the main shapes and focal subject.",
  "Add smaller supporting details.",
  "Finish with accents, highlights and soft shading.",
];

const stepHints = [
  ["Begin with simple colors", "Fill the biggest areas first", "Keep the page light"],
  ["Color the main subject", "Use clear, even regions", "Follow the outlines"],
  ["Add supporting details", "Repeat colors for balance", "Leave tiny highlights"],
  ["Finish the small accents", "Check the complete page", "Have fun!"],
];

const StepIcons = [Layers3, PaintBucket, Shirt, Sparkles];

export function ColorGuideStudio({ id, generationId, projectTitle, palette, coloredUrl, stepUrls, focusStepUrls, guide }: {
  id: string;
  generationId: string;
  projectTitle: string;
  palette: { name: string; colors: string[] };
  coloredUrl: string;
  stepUrls: string[];
  focusStepUrls: string[];
  guide: ColoringGuideDocument;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = Array.from({ length: 4 }, (_, index) => ({
    image: stepUrls[index] ?? coloredUrl,
    focusImage: focusStepUrls[index] ?? stepUrls[index] ?? coloredUrl,
    copy: guide.steps[index]?.title ?? fallbackSteps[index],
    colors: guide.steps[index]?.colors ?? [],
    hints: guide.steps[index]?.hints ?? stepHints[index],
  }));

  function colorsForStep(index: number) {
    return steps[index].colors;
  }

  const activeColors = colorsForStep(activeStep);

  return <section className="guide-workbench-v2 page-frame">
    <aside className="guide-pass-rail" aria-label="Coloring guide passes">
      <div className="guide-pass-list">
        {steps.map((step, index) => {
          const Icon = StepIcons[index];
          const selected = activeStep === index;
          return <button
            key={index}
            type="button"
            className={selected ? "active" : ""}
            onClick={() => setActiveStep(index)}
            aria-pressed={selected}
            aria-label={`Pass ${index + 1}: ${step.copy}`}
          >
            <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
            <span>{index + 1}</span>
            <i className="guide-pass-colors" aria-hidden="true">
              {colorsForStep(index).map((color) => <em key={color} style={{ backgroundColor: color }} />)}
            </i>
            {selected ? <Check className="guide-pass-check" size={13} strokeWidth={3} aria-hidden="true" /> : null}
          </button>;
        })}
      </div>

      <button className="guide-finished-thumb" type="button" onClick={() => setActiveStep(3)} aria-label="Show the finished coloring reference">
        <img src={coloredUrl} alt="" />
        <span><small>Finished result</small><b>{palette.name}</b></span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </aside>

    <div className="guide-stage-area">
      <div className="guide-comparison-layout">
        <section className="guide-colors-panel">
          <span className="guide-panel-label">PASS {activeStep + 1} COLORS</span>
          <h2>{steps[activeStep].copy}</h2>
          <div className="guide-color-values">
            {activeColors.map((color) => <div key={color}><i style={{ backgroundColor: color }} /><code>{color}</code></div>)}
          </div>
          <div className="guide-pass-tips">
            <Lightbulb size={22} aria-hidden="true" />
            <ul>{steps[activeStep].hints.map((hint) => <li key={hint}>{hint}</li>)}</ul>
          </div>
          <div className="guide-project-name"><small>Saved project</small><b>{projectTitle}</b></div>
          <div className="guide-quick-actions">
            <a href={`/api/kits/${id}/export?format=guide-pdf&include=final,steps,swatch`} download><Download size={16} />Guide PDF</a>
            <a href={`/api/kits/${id}/print`} target="_blank" rel="noreferrer"><Printer size={16} />Print</a>
          </div>
        </section>

        <section className="guide-compare-card">
          <h3>New in pass {activeStep + 1}</h3>
          <div><img src={steps[activeStep].focusImage} alt={`Regions to color in pass ${activeStep + 1}`} /></div>
        </section>

        <ArrowRight className="guide-compare-arrow" size={24} strokeWidth={1.7} aria-hidden="true" />

        <section className="guide-compare-card guide-final-card">
          <h3>Result after pass {activeStep + 1}</h3>
          <div><img src={steps[activeStep].image} alt={`Cumulative result after pass ${activeStep + 1}`} /></div>
        </section>
      </div>

      <footer className="guide-stage-actions">
        {activeStep === 0
          ? <Link className="guide-back-button" href={`/projects/${generationId}/palette`}><ArrowLeft size={19} />Back</Link>
          : <button className="guide-back-button" type="button" onClick={() => setActiveStep((step) => Math.max(0, step - 1))}><ArrowLeft size={19} />Back</button>}
        {activeStep < 3
          ? <button className="guide-next-button" type="button" onClick={() => setActiveStep((step) => Math.min(3, step + 1))}>Next pass<ArrowRight size={20} /></button>
          : <Link className="guide-next-button" href={`/kits/${id}/export`}>Continue to Download<ArrowRight size={20} /></Link>}
      </footer>
    </div>
  </section>;
}
