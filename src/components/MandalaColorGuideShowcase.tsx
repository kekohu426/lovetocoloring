"use client";

import Image from "next/image";
import { FileText, Flower2, ListChecks, Palette } from "lucide-react";
import { useState } from "react";

const palette = [
  { name: "Coral", hex: "#FF725E" },
  { name: "Marigold", hex: "#FFC43D" },
  { name: "Leaf", hex: "#87C978" },
  { name: "Teal", hex: "#35B8B2" },
  { name: "Violet", hex: "#8B6ED1" },
] as const;

const stages = [
  {
    label: "Line Art",
    image: "mandala-line-art.png",
    status: "READY TO COLOR",
    title: "Start with Clean Line Art",
    what: "Print the blank page or keep it beside you as the base for every coloring pass.",
    colors: [] as string[],
    tip: "Use the outlined regions to plan broad areas before adding smaller details.",
    checks: ["Printable base is ready", "All repeating shapes are visible", "No color has been added yet"],
  },
  {
    label: "Preview",
    image: "mandala-color-reference.png",
    status: "FINISHED REFERENCE",
    title: "Preview the Finished Colors",
    what: "See the complete Sunset Garden palette before you begin coloring.",
    colors: ["Coral", "Marigold", "Leaf", "Teal", "Violet"],
    tip: "Keep this reference nearby so repeated shapes stay balanced across the page.",
    checks: ["Full palette is visible", "Color placement is coordinated", "Reference is ready to print"],
  },
  {
    label: "Pass 1",
    image: "mandala-pass-1.png",
    status: "PASS 1 OF 4 · BIG AREAS",
    title: "Lay Down the First Colors",
    what: "Begin with the largest outer petals and the easiest repeating regions.",
    colors: ["Coral", "Marigold"],
    tip: "Color matching shapes together and leave the smaller inner layers blank.",
    checks: ["Largest petals are colored", "Warm colors are distributed evenly", "Inner details remain blank"],
  },
  {
    label: "Pass 2",
    image: "mandala-pass-2.png",
    status: "PASS 2 OF 4 · MAIN LAYERS",
    title: "Build the Main Layers",
    what: "Fill the middle petals and repeating leaf shapes.",
    colors: ["Coral", "Leaf", "Teal"],
    tip: "Use light, even strokes and keep repeated shapes consistent.",
    checks: ["Middle petals are colored", "Main leaf shapes are colored", "Center details remain blank"],
  },
  {
    label: "Pass 3",
    image: "mandala-pass-3.png",
    status: "PASS 3 OF 4 · INNER SHAPES",
    title: "Add the Supporting Colors",
    what: "Move inward and add contrast to the smaller petals and supporting shapes.",
    colors: ["Marigold", "Teal", "Violet"],
    tip: "Alternate nearby colors so every layer remains easy to distinguish.",
    checks: ["Inner petals are colored", "Cool accents add contrast", "The focal center remains open"],
  },
  {
    label: "Pass 4",
    image: "mandala-pass-4.png",
    status: "PASS 4 OF 4 · FINAL DETAILS",
    title: "Finish the Small Details",
    what: "Complete the center and the smallest accents, then compare with the final reference.",
    colors: ["Coral", "Marigold", "Leaf", "Teal", "Violet"],
    tip: "Use your sharpest pencil for the center and keep the final marks light.",
    checks: ["Center details are complete", "Repeated accents are balanced", "The finished page matches the plan"],
  },
] as const;

export function MandalaColorGuideShowcase() {
  const [selectedIndex, setSelectedIndex] = useState(3);
  const selected = stages[selectedIndex];

  return (
    <div className="mandala-guide-showcase">
      <div className="mandala-guide-workspace">
        <aside className="mandala-guide-project">
          <div className="mandala-guide-palette">
            <strong>SUNSET GARDEN</strong>
            <ul>
              {palette.map((color) => (
                <li key={color.name}>
                  <i style={{ backgroundColor: color.hex }} aria-hidden="true" />
                  <span>{color.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="mandala-guide-stage">
          <div className="mandala-guide-gallery">
            <div className="mandala-guide-art">
              <Image
                src={`/images/homepage/coloring-workflow/${selected.image}`}
                alt={`Botanical mandala ${selected.label.toLowerCase()}`}
                width={900}
                height={1200}
                sizes="(min-width: 1200px) 34vw, (min-width: 768px) 52vw, 88vw"
                loading="eager"
                priority={selectedIndex === 3}
              />
            </div>
            <div className="mandala-guide-thumbnails" role="tablist" aria-label="Coloring guide stages">
              {stages.map((stage, index) => (
                <button
                  className={selectedIndex === index ? "active" : undefined}
                  key={stage.label}
                  type="button"
                  role="tab"
                  aria-selected={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                >
                  <Image src={`/images/homepage/coloring-workflow/${stage.image}`} alt="" width={90} height={120} sizes="72px" />
                  <span>{stage.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="mandala-guide-benefits" aria-label="Color guide benefits">
        <article><Palette size={22} /><div><strong>Coordinated Palette</strong><span>Curated colors that work beautifully together.</span></div></article>
        <article><Flower2 size={22} /><div><strong>Finished Color Reference</strong><span>See the final look before you start coloring.</span></div></article>
        <article><ListChecks size={22} /><div><strong>Four-Step Guide</strong><span>Clear passes that make coloring simple and fun.</span></div></article>
        <article><FileText size={22} /><div><strong>Printable PDF &amp; PNG</strong><span>High-quality files ready for printing anytime.</span></div></article>
      </div>
    </div>
  );
}
