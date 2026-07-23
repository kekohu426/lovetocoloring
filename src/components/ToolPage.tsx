import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Home, Image as ImageIcon, Sparkles } from "lucide-react";
import { Generator } from "./Generator";
import { JsonLd } from "./JsonLd";
import type { Dictionary } from "@/i18n";
import { SITE } from "@/lib/config";
import type { GeneratorMode } from "@/lib/navigation";
import type { ScenarioId } from "@/lib/scenarios";

interface ToolPageContent {
  path: string;
  mode: GeneratorMode;
  eyebrow: string;
  title: string;
  description: string;
  benefits: Array<{ title: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
}

const textHow = [
  ["Name the subject", "A friendly dinosaur is clearer than a list of unrelated objects."],
  ["Add a simple setting", "Use one scene such as a birthday party, flower garden or classroom."],
  ["Match the colorist", "Choose large simple regions for children or more detail for adults."],
  ["Pick the color mood", "Compare achievable palettes before creating the finished guide."],
];

const photoHow = [
  ["Upload a clear photo", "Choose a well-lit portrait, pet, family moment or object."],
  ["Set the detail", "Use simple shapes for children or preserve more texture for adults."],
  ["Review the outlines", "Check recognizability, clean edges and printable white space."],
  ["Choose your palette", "Create the final color mood and follow four coloring passes."],
];

function HowSection({ mode }: { mode: GeneratorMode }) {
  const items = mode === "text" ? textHow : photoHow;
  return <section className="section seo-section">
    <div className="section-heading"><span className="eyebrow">{mode === "text" ? "BETTER PROMPTS, BETTER PAGES" : "FROM PHOTO TO PRINTABLE PAGE"}</span><h2>{mode === "text" ? "How to create a coloring page from text" : "How to turn a picture into a coloring page"}</h2><p><strong>{mode === "text" ? "Start with one clear idea." : "Use a clear photo with one recognizable subject."}</strong> {mode === "text" ? "Name the subject, setting, audience and detail level. The generator handles the printable composition." : `${SITE.name} preserves important contours while simplifying distracting texture into comfortable coloring regions.`}</p></div>
    <div className="how-grid">{items.map(([title, body], index) => <article key={title}><b>{index + 1}</b><h3>{title}</h3><p>{body}</p></article>)}</div>
  </section>;
}

function TextSections() {
  return <>
    <section className="section prompt-gallery">
      <div className="section-heading"><span className="eyebrow">PROMPT IDEAS</span><h2>Text prompts designed for coloring</h2></div>
      <div className="prompt-examples">
        <article>
          <figure className="prompt-example-visual">
            <Image src="/images/homepage/case-kids.png" alt="Dinosaur birthday line art beside its finished colored reference" width={1024} height={1024} sizes="(min-width: 1100px) 34vw, (min-width: 700px) 70vw, 100vw" />
            <div className="prompt-example-state-labels" aria-hidden="true"><b>Line art</b><b>Colored reference</b></div>
          </figure>
          <span>Kids &amp; Family</span><h3>Dinosaur birthday party</h3><p>&quot;A friendly dinosaur wearing a party hat beside three balloons and a small cake, with large simple shapes for ages 5-7.&quot;</p>
        </article>
        <article>
          <figure className="prompt-example-visual">
            <Image src="/images/homepage/case-adult.png" alt="Detailed botanical mandala line art beside its finished colored reference" width={1024} height={1024} sizes="(min-width: 1100px) 34vw, (min-width: 700px) 70vw, 100vw" />
            <div className="prompt-example-state-labels" aria-hidden="true"><b>Line art</b><b>Colored reference</b></div>
          </figure>
          <span>Adult Coloring</span><h3>Botanical mandala</h3><p>&quot;A symmetrical botanical mandala with layered petals and leaves, clean closed lines and detailed regions for adult coloring.&quot;</p>
        </article>
        <article className="prompt-writing"><span>Prompt formula</span><h3>Subject + setting + audience + detail</h3><p>This structure gives the AI enough direction without overcrowding the page.</p><code>A curious fox + reading under a tree + ages 6-8 + balanced detail</code></article>
      </div>
    </section>
    <section className="section audience-ideas">
      <div className="section-heading"><span className="eyebrow">SEARCH BY CREATIVE GOAL</span><h2>Coloring page ideas by audience</h2><p>The same tool should produce a different composition and level of guidance for a child, a classroom or an adult colorist.</p></div>
      <div className="idea-columns">
        <article><span>Kids &amp; Family</span><h3>Easy, recognizable scenes</h3><ul><li>Dinosaur birthday parties</li><li>Friendly animals and vehicles</li><li>Holiday and rainy-day activities</li></ul><p>Use one main subject, large closed regions and a cheerful four-pass color guide.</p></article>
        <article><span>Classroom</span><h3>Learning through coloring</h3><ul><li>Plant and animal life cycles</li><li>Space, maps and community helpers</li><li>Seasonal classroom sheets</li></ul><p>Choose clear educational objects and a layout that remains readable after printing.</p></article>
        <article><span>Adult Coloring</span><h3>Detailed mindful designs</h3><ul><li>Botanical mandalas</li><li>Geometric patterns</li><li>Cozy rooms and fantasy scenes</li></ul><p>Use denser detail, sophisticated color relationships and optional layering advice.</p></article>
      </div>
    </section>
    <section className="section palette-explainer">
      <div className="palette-copy"><span className="eyebrow">FROM COLORS TO A COLORING PLAN</span><h2>Four palettes, each with a clear purpose</h2><p>Each palette gives the page a distinct mood while preserving contrast between neighboring regions. The guide separates dominant, supporting and accent colors so the result stays balanced and achievable.</p><div className="palette-principles"><span><b>Dominant color</b>Sets the main visual mood.</span><span><b>Supporting colors</b>Separate nearby shapes clearly.</span><span><b>Accent color</b>Draws attention to focal details.</span><span><b>Coloring order</b>Moves from broad areas to finishing touches.</span></div></div>
      <figure>
        <div className="palette-reference-visual">
          <Image src="/images/homepage/case-adult.png" alt="Detailed botanical coloring page shown as printable line art and a richly colored pencil reference" width={1024} height={1024} sizes="(min-width: 1100px) 38vw, 100vw" />
          <div className="palette-reference-labels" aria-hidden="true"><b>Printable line art</b><b>Finished palette</b></div>
        </div>
        <figcaption>Real example: detailed line art transformed with a coordinated botanical color palette.</figcaption>
      </figure>
    </section>
  </>;
}

function PhotoSections() {
  return <>
    <section className="section photo-quality">
      <div className="quality-visual quality-real-comparison">
        <figure>
          <div className="quality-image-crop source">
            <span>Source photo</span>
            <img src="/images/homepage/case-pet.png" alt="Real golden retriever photo used as a coloring page source" />
          </div>
          <figcaption>Real source photo: clear pet, natural light</figcaption>
        </figure>
        <span><ArrowRight size={16} /></span>
        <figure>
          <div className="quality-image-crop result">
            <span>Coloring page</span>
            <img src="/images/homepage/case-pet.png" alt="Golden retriever photo converted into printable line art" />
          </div>
          <figcaption>Generated result: recognizable printable line art</figcaption>
        </figure>
      </div>
      <div className="quality-copy"><span className="eyebrow">PHOTO QUALITY GUIDE</span><h2>Which photos make the best coloring pages?</h2><ul><li><b>Clear subject</b><span>One person, pet or object is easier to recognize.</span></li><li><b>Good lighting</b><span>Visible edges help preserve meaningful shapes.</span></li><li><b>Simple background</b><span>Less clutter creates larger coloring areas.</span></li><li><b>Complete framing</b><span>Avoid cutting off faces, paws, hands or key objects.</span></li></ul></div>
    </section>
    <section className="section photo-use-cases">
      <div className="section-heading"><span className="eyebrow">PERSONALIZED COLORING IDEAS</span><h2>Photos you can turn into coloring pages</h2><p>Choose images with a clear focal subject for activities, keepsakes and printable gifts.</p></div>
      <div className="use-case-grid"><article><span>Portraits</span><h3>Children and family</h3><p>Create a recognizable activity page from a clear portrait, birthday moment or family memory.</p></article><article><span>Pets</span><h3>Dogs, cats and companions</h3><p>Preserve distinctive ears, markings and expressions while simplifying fur and texture.</p></article><article><span>Memories</span><h3>Travel and celebrations</h3><p>Turn a favorite location or celebration into a page the family can color together.</p></article><article><span>Objects</span><h3>Vehicles, toys and homes</h3><p>Convert clear silhouettes into printable pages with comfortable enclosed areas.</p></article></div>
    </section>
    <section className="section trust-section">
      <div className="trust-copy"><span className="eyebrow">CLEAR PRODUCT PROMISES</span><h2>Photo privacy, ownership and retention</h2><p>Your source photo is stored under a random, non-indexed path so the selected image model can process it. It is never placed in a public gallery or exposed through another user&apos;s account.</p><div className="trust-points"><span><b>Private in the app</b>Generated work stays attached to its owner and is never shared automatically.</span><span><b>No gallery publishing</b>Personal photos and results do not appear in public discovery pages.</span><span><b>Your creative files</b>You can download the line art, color reference and guide you create.</span></div></div>
      <aside><span className="eyebrow">BEFORE YOU PRINT</span><h2>Coloring page quality checklist</h2><ul><li><b>Recognizable:</b> the main person, pet or object still looks familiar.</li><li><b>Complete:</b> faces, hands, paws and important objects are not cut off.</li><li><b>Colorable:</b> lines form useful closed regions without excessive texture.</li><li><b>Print-safe:</b> important details remain inside white page margins.</li><li><b>Clean:</b> no unintended words, logos, watermarks or dark filled areas.</li></ul></aside>
    </section>
  </>;
}

function AnswerSection({ mode }: { mode: GeneratorMode }) {
  return <section className="section answer-section"><div className="answer-card"><span className="eyebrow">DIRECT ANSWER</span><h2>{mode === "text" ? "What is a text to coloring page generator?" : "What is a photo to coloring page converter?"}</h2><p>{mode === "text" ? `A text to coloring page generator converts a written description into printable black-and-white line art. ${SITE.name} adds page-specific palettes, a finished reference and ordered coloring steps.` : `A photo to coloring page converter turns the visual boundaries in a picture into simplified black-and-white outlines. ${SITE.name} also creates palette options, a colored reference and a step-by-step guide.`}</p><div className="answer-facts"><span><b>{mode === "text" ? "Best input" : "Best photos"}</b>{mode === "text" ? "One subject and setting" : "Clear, well-lit subjects"}</span><span><b>{mode === "text" ? "Best output" : "Common uses"}</b>{mode === "text" ? "Clean closed regions" : "Kids, pets, family memories"}</span><span><b>Included guidance</b>Palettes and four coloring steps</span></div></div></section>;
}

export function ToolPage({ t, content, presetId, initialPrompt }: { t: Dictionary; content: ToolPageContent; presetId: ScenarioId; initialPrompt?: string }) {
  const isText = content.mode === "text";
  const structured = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: content.title, url: `${SITE.url}${content.path}`, description: content.description, applicationCategory: "DesignApplication", operatingSystem: "Web", isAccessibleForFree: true },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: content.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
  ];

  return <div className="prototype-tool tool-page">
    <JsonLd data={structured} />
    <section className="tool-hero">
      <div className="breadcrumbs"><Link href="/"><Home size={12} /> Home</Link><span>/</span><b>{isText ? "Text to Coloring Page" : "Photo to Coloring Page"}</b></div>
      <div className="pill">{isText ? <Sparkles size={15} /> : <ImageIcon size={15} />} {content.eyebrow}</div>
      <h1>{isText ? <>Text to Coloring Page Generator <em>with a plan to color it.</em></> : <>Turn Any Photo into a Coloring Page <em>and color it beautifully.</em></>}</h1>
      <p>{isText ? "Describe a scene, choose who it is for and generate printable line art. Then compare palettes, create the finished look and follow a step-by-step color guide." : `Upload a portrait, pet or family memory. ${SITE.name} creates clean printable outlines, then gives you color directions and an easy guide for finishing the page.`}</p>
      <div className="intent-facts"><span><Check size={14} /> {isText ? "No drawing skills" : "Clear, simplified lines"}</span><span><Check size={14} /> {isText ? "A4 & US Letter" : "Private account access"}</span><span><Check size={14} /> Printable color guide</span></div>
    </section>

    <Generator t={t} lockedMode={content.mode} initialPresetId={presetId} initialPrompt={initialPrompt} />
    <HowSection mode={content.mode} />
    {isText ? <TextSections /> : <PhotoSections />}
    <AnswerSection mode={content.mode} />
    <section className="section faq-section">
      <div className="section-heading">
        <span className="eyebrow">{isText ? "QUESTIONS ABOUT TEXT GENERATION" : "QUESTIONS ABOUT PHOTO CONVERSION"}</span>
        <h2>{isText ? "Frequently asked questions about text to coloring pages." : "Frequently asked questions about photo coloring pages."}</h2>
        <p>{isText ? "Everything you need to know about turning written ideas into printable coloring pages and color guides." : "Everything you need to know about converting photos into printable line art, palettes and color guides."}</p>
      </div>
      <div className="faq-list">{content.faq.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
    </section>
  </div>;
}
