"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

type ExampleId = "pet" | "mandala" | "kids" | "family";

type Example = {
  id: ExampleId;
  label: string;
  colors: string[];
  sourceImage?: string;
  createImage: string;
  paletteImage: string;
  guideImages: string[];
  downloadImage: string;
};

const examples: Example[] = [
  {
    id: "pet",
    label: "Pet",
    colors: ["#F7A52C", "#C9782A", "#F58F9A", "#FFF0C8", "#A9D9A7"],
    sourceImage: "/images/homepage/coloring-workflow/pet-cat-final.png",
    createImage: "/images/homepage/coloring-workflow/pet-cat-line.png",
    paletteImage: "/images/homepage/coloring-workflow/pet-cat-line-paper.png",
    guideImages: [
      "/images/homepage/coloring-workflow/pet-cat-line-paper.png",
      "/images/homepage/coloring-workflow/pet-cat-pass-2.png",
      "/images/homepage/coloring-workflow/pet-cat-final-white.png",
      "/images/homepage/coloring-workflow/pet-cat-final.png",
    ],
    downloadImage: "/images/homepage/coloring-workflow/pet-cat-final.png",
  },
  {
    id: "mandala",
    label: "Mandala",
    colors: ["#FF725E", "#FFC43D", "#87C978", "#35B8B2", "#8B6ED1"],
    createImage: "/images/homepage/coloring-workflow/mandala-line-art.png",
    paletteImage: "/images/homepage/how-it-works/02-adult-mandala-palettes.png",
    guideImages: [
      "/images/homepage/coloring-workflow/mandala-pass-1.png",
      "/images/homepage/coloring-workflow/mandala-pass-2.png",
      "/images/homepage/coloring-workflow/mandala-pass-3.png",
      "/images/homepage/coloring-workflow/mandala-pass-4.png",
    ],
    downloadImage: "/images/homepage/coloring-workflow/mandala-color-reference.png",
  },
  {
    id: "kids",
    label: "Kids",
    colors: ["#FF725E", "#FFC43D", "#8FD17F", "#35B8B2", "#8B6ED1"],
    createImage: "/images/homepage/coloring-workflow/birthday-dinosaur-line-art.png",
    paletteImage: "/images/homepage/coloring-workflow/birthday-dinosaur-color-reference.png",
    guideImages: [
      "/images/homepage/coloring-workflow/birthday-dinosaur-pass-1.png",
      "/images/homepage/coloring-workflow/birthday-dinosaur-pass-2.png",
      "/images/homepage/coloring-workflow/birthday-dinosaur-pass-3.png",
      "/images/homepage/coloring-workflow/birthday-dinosaur-pass-4.png",
    ],
    downloadImage: "/images/homepage/coloring-workflow/birthday-dinosaur-color-reference.png",
  },
  {
    id: "family",
    label: "Family",
    colors: ["#FFD0C5", "#F6A77D", "#F7CF66", "#8CCEC6", "#7E91CF"],
    sourceImage: "/images/scenarios/family-source.webp",
    createImage: "/images/scenarios/family-line.webp",
    paletteImage: "/images/scenarios/family-line.webp",
    guideImages: [
      "/images/homepage/coloring-workflow/family-pass-1.png",
      "/images/homepage/coloring-workflow/family-pass-2.png",
      "/images/homepage/coloring-workflow/family-pass-3.png",
      "/images/homepage/coloring-workflow/family-pass-4.png",
    ],
    downloadImage: "/images/scenarios/family-color.webp",
  },
];

const stages = [
  {
    number: "1",
    short: "Create",
    title: "Create your coloring page",
    copy: "Describe an idea or upload a photo. Choose the style, audience, and level of detail.",
  },
  {
    number: "2",
    short: "Palette",
    title: "Choose a color palette",
    copy: "Compare 4 coordinated color palettes created specifically for your page.",
  },
  {
    number: "3",
    short: "Guide",
    title: "Follow 4 guided coloring steps",
    copy: "Start with broad areas, then add subjects, small details, and finishing accents.",
  },
  {
    number: "4",
    short: "Download",
    title: "Download your coloring kit",
    copy: "Get the blank page, colored reference, 4-step guide, PNG files, and a print-ready PDF.",
  },
] as const;

function StageVisual({ example, stage }: { example: Example; stage: number }) {
  if (stage === 1 && example.sourceImage) {
    return <div className={`homepage-v2-create-pair${example.id === "pet" ? " square-art" : ""}`}>
      <figure><Image src={example.sourceImage} alt={`${example.label} original`} width={640} height={480} sizes="(min-width: 1000px) 10vw, 42vw" /></figure>
      <ArrowRight size={16} aria-hidden="true" />
      <figure><Image src={example.createImage} alt={`${example.label} line art`} width={640} height={480} sizes="(min-width: 1000px) 10vw, 42vw" /></figure>
    </div>;
  }

  if (stage === 3 && example.guideImages.length === 4) {
    return <div className="homepage-v2-interactive-guide">
      {example.guideImages.map((src, index) => <figure key={src}>
        <Image src={src} alt={`${example.label} coloring pass ${index + 1}`} width={360} height={450} sizes="(min-width: 1000px) 7vw, 20vw" />
        <span>{index + 1}</span>
      </figure>)}
    </div>;
  }

  const src = stage === 1
    ? example.createImage
    : stage === 2
      ? example.paletteImage
      : stage === 3
        ? example.guideImages[0]
        : example.downloadImage;

  return <figure className={`homepage-v2-interactive-image stage-${stage}${example.id === "pet" ? " square-art" : ""}`}>
    <Image src={src} alt={`${example.label} example for step ${stage}`} width={960} height={720} sizes="(min-width: 1000px) 21vw, 88vw" />
    {stage === 3 ? <div className="homepage-v2-pass-dots">{[1, 2, 3, 4].map((pass) => <span key={pass}>{pass}</span>)}</div> : null}
    {stage === 4 ? <div className="homepage-v2-output-types"><span>PDF</span><span>PNG</span><span>ZIP</span><span>PRINT</span></div> : null}
  </figure>;
}

export function InteractiveHowItWorks({ textHref }: { textHref: string }) {
  const [activeId, setActiveId] = useState<ExampleId>("kids");
  const active = examples.find((example) => example.id === activeId) ?? examples[0];

  return <>
    <div className="homepage-v2-example-switcher">
      <div className="homepage-v2-example-tabs" role="tablist" aria-label="Choose a coloring page example">
        {examples.map((example) => <button
          key={example.id}
          type="button"
          role="tab"
          aria-selected={active.id === example.id}
          onClick={() => setActiveId(example.id)}
        >
          {example.label}
        </button>)}
      </div>
    </div>

    <div className="homepage-v2-how-grid">
      {stages.map((stage, index) => <article key={stage.number}>
        <h3>{stage.title}</h3>
        <p>{stage.copy}</p>
        {index === 2 ? <strong className="homepage-v2-signature-copy">See exactly what to color in each pass.</strong> : null}
        {index === 1 ? <div className="homepage-v2-inline-palette" aria-label={`${active.label} color palette`}>{active.colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</div> : null}
        <StageVisual example={active} stage={index + 1} />
      </article>)}
    </div>

    <footer className="homepage-v2-how-footer">
      <div className="homepage-v2-how-actions">
        <Link className="primary" href={textHref}>Create Your Coloring Page <ArrowRight size={15} /></Link>
      </div>
    </footer>
  </>;
}
