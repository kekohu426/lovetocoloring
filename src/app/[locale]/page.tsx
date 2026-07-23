import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { HomepageCreationTabs } from "@/components/HomepageCreationTabs";
import { InteractiveHowItWorks } from "@/components/InteractiveHowItWorks";
import { JsonLd } from "@/components/JsonLd";
import { MandalaColorGuideShowcase } from "@/components/MandalaColorGuideShowcase";
import { isLocale, localePath, type Locale } from "@/i18n";
import { SITE } from "@/lib/config";

const title = "AI Coloring Page Generator with Color Guidance | Magic Coloring Page";
const description = "Turn an idea or photo into printable coloring pages with clean line art, four matching palettes, a colored reference and a step-by-step color guide.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    images: [{
      url: "/images/homepage/homepage-hero-art.png",
      width: 1536,
      height: 1024,
      alt: "AI coloring page generator showing dinosaur line art, colored reference, palettes and step-by-step guide",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/homepage/homepage-hero-art.png"],
  },
};

const faq = [
  {
    question: "Can I turn a photo into a coloring page?",
    answer: "Yes. Upload a favorite photo and Magic Coloring Page converts it into clean, printable line art while preserving the main subject and composition.",
  },
  {
    question: "Are the coloring pages ready to print?",
    answer: "Yes. Pages are formatted for A4 and US Letter and can be downloaded as high-resolution PNG or print-ready PDF files.",
  },
  {
    question: "Does every page include color suggestions?",
    answer: "Each completed page can include four coordinated palettes, a colored reference and an easy step-by-step coloring guide.",
  },
  {
    question: "Can I create pages for both children and adults?",
    answer: "Yes. Audience and detail settings adjust line weight, coloring-area size and complexity for children, classrooms and adult colorists.",
  },
  {
    question: "What files can I download?",
    answer: "Available outputs include line-art PNG, colored-reference PNG, A4 or US Letter PDF and the printable color guide.",
  },
];

const howSteps = [
  {
    number: "1",
    label: "PET PHOTO",
    title: "Create your coloring page",
    copy: "Describe an idea or upload a photo. Choose the style, audience, and level of detail.",
    image: "/images/homepage/how-it-works/01-pet-photo-to-line-art.png",
    alt: "Pet photo transformed into clean printable pet line art",
  },
  {
    number: "2",
    label: "ADULT MANDALA",
    title: "Choose a color palette",
    copy: "Compare 4 coordinated color palettes created specifically for your page.",
    image: "/images/homepage/how-it-works/02-adult-mandala-palettes.png",
    alt: "Adult mandala line art with four coordinated color palette choices",
  },
  {
    number: "3",
    label: "KIDS ANIMAL",
    title: "Follow 4 guided coloring steps",
    copy: "Start with broad areas, then add subjects, small details, and finishing accents.",
    image: "/images/homepage/how-it-works/03-kids-fox-four-coloring-passes.png",
    alt: "Kids fox coloring page shown through four cumulative coloring steps",
  },
  {
    number: "4",
    label: "FAMILY BIRTHDAY",
    title: "Download your coloring kit",
    copy: "Get the blank page, colored reference, 4-step guide, PNG files, and a print-ready PDF.",
    image: "/images/homepage/how-it-works/04-family-birthday-coloring-kit.png",
    alt: "Family birthday coloring kit with line art, colored reference, guide and printable files",
  },
] as const;

const cases = [
  {
    id: "kids",
    eyebrow: "KIDS COLORING PAGES",
    title: "Kids Coloring Pages",
    copy: "Create printable kids coloring pages from a simple idea. Thick outlines, large coloring spaces and cheerful, age-appropriate scenes make every page easy for younger children to enjoy at home or in class.",
    before: "A child-friendly idea",
    after: "Printable kids coloring page",
    bestFor: "Parents, preschool and early elementary activities",
    keywords: ["kids coloring pages", "printable coloring sheets", "easy line art", "color guide for children"],
    cta: "Create kids coloring pages",
    image: "/images/homepage/case-kids.png",
    alt: "Kids birthday dinosaur coloring page with line art and colored example",
    mode: "text",
    preset: "kids",
  },
  {
    id: "photo",
    eyebrow: "PHOTO TO COLORING PAGE",
    title: "Photo to Coloring Page",
    copy: "Turn a family portrait, child photo or favorite memory into faithful, clean line art. The finished custom coloring page keeps the people and composition recognizable while preparing the image for easy printing and coloring.",
    before: "Favorite family photo",
    after: "Clean printable line art",
    bestFor: "Family keepsakes, portraits and personalized gifts",
    keywords: ["photo to coloring page", "turn photo into line art", "custom coloring page", "family coloring book"],
    cta: "Convert a photo",
    image: "/images/homepage/case-photo.png",
    alt: "Family photo converted into a printable coloring page",
    mode: "photo",
    preset: "family",
  },
  {
    id: "classroom",
    eyebrow: "CLASSROOM COLORING WORKSHEETS",
    title: "Classroom Worksheets",
    copy: "Create printable educational coloring activities for lessons, learning centers and take-home practice. Classroom worksheets use clear visual groups, teachable subjects and practical line detail for students to color with confidence.",
    before: "Lesson topic or prompt",
    after: "Ready-to-print worksheet",
    bestFor: "Teachers, homeschool lessons and learning centers",
    keywords: ["classroom worksheets", "educational coloring pages", "printable learning activities", "teacher resources"],
    cta: "Explore classroom pages",
    image: "/images/homepage/case-classroom.png",
    alt: "Teacher and children using a printable classroom coloring worksheet",
    mode: "text",
    preset: "classroom",
  },
  {
    id: "adult",
    eyebrow: "ADULT COLORING PAGES",
    title: "Adult Coloring Pages",
    copy: "Generate detailed floral, botanical and geometric designs with sophisticated color palettes. These printable adult coloring pages balance intricate line art with calm, satisfying spaces for mindful and relaxing creativity.",
    before: "Detailed black line art",
    after: "Coordinated color reference",
    bestFor: "Mindful coloring, creative breaks and hobby artists",
    keywords: ["adult coloring pages", "floral coloring page", "mandala line art", "relaxing coloring printable"],
    cta: "Create adult coloring pages",
    image: "/images/homepage/case-adult.png",
    alt: "Detailed adult floral coloring page with colored pencil reference",
    mode: "text",
    preset: "adult",
  },
  {
    id: "pet",
    eyebrow: "PET COLORING PAGES",
    title: "Pet Coloring Pages",
    copy: "Transform a favorite dog, cat or other pet photo into a personal coloring page. Clean outlines preserve the pet's recognizable features, creating a printable keepsake for children, families and thoughtful gifts.",
    before: "Favorite pet photo",
    after: "Personalized pet line art",
    bestFor: "Pet owners, children and one-of-a-kind gifts",
    keywords: ["pet coloring pages", "dog coloring page", "photo to line art", "personalized pet gift"],
    cta: "Turn a pet photo into line art",
    image: "/images/homepage/case-pet.png",
    alt: "Golden retriever photo converted into a coloring page",
    mode: "photo",
    preset: "pet",
  },
  {
    id: "birthday",
    eyebrow: "BIRTHDAY COLORING PAGES",
    title: "Birthday Coloring Pages",
    copy: "Make personalized birthday coloring pages with balloons, cake, gifts and playful party scenes. Add a child's celebration theme and create a printable activity guests can color and take home.",
    before: "A birthday party idea",
    after: "Personalized party printable",
    bestFor: "Birthday tables, party favors and rainy-day fun",
    keywords: ["birthday coloring pages", "personalized coloring sheet", "party activity printable", "kids birthday activity"],
    cta: "Create birthday coloring pages",
    image: "/images/homepage/case-birthday.png",
    alt: "Birthday coloring page with balloons, cake and colored reference",
    mode: "text",
    preset: "birthday",
  },
] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const textHref = localePath(locale, "/text-to-coloring-page");
  const photoHref = localePath(locale, "/photo-to-coloring-page");
  const pricingHref = localePath(locale, "/pricing");
  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE.name,
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      url: SITE.url,
      description,
      featureList: ["Text to coloring page", "Photo to coloring page", "Coordinated color palettes", "Colored reference", "Step-by-step color guide", "Printable PDF and PNG exports"],
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Turn any idea or photo into a printable coloring plan",
      step: howSteps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.title, text: step.copy })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
    },
  ];

  return <div className="homepage-v2">
    <JsonLd data={structured} />

    <section className="homepage-v2-hero">
      <div className="homepage-v2-hero-inner">
        <div className="homepage-v2-hero-copy">
          <span className="homepage-v2-eyebrow">LINE ART + COLOR GUIDE, IN ONE</span>
          <h1>AI Coloring Page Generator with a <em>Color Guide Built In.</em></h1>
          <p>Describe an idea or upload a favorite photo. Get clean, printable line art, four matching palettes, a colored reference, and an easy step-by-step color guide.</p>
        </div>

        <figure className="homepage-v2-hero-art">
          <Image src="/images/homepage/homepage-hero-art.png" alt="AI coloring page generator showing dinosaur line art, colored reference, palettes and step-by-step guide" width={1536} height={1024} loading="eager" fetchPriority="high" sizes="(min-width: 1200px) 54vw, (min-width: 768px) 50vw, 100vw" />
          <div className="homepage-v2-floating-palette" aria-label="Five-color palette">{["#ff725e", "#ffc43d", "#9bd277", "#36bdb6", "#9a78d4"].map((color) => <i key={color} style={{ backgroundColor: color }} />)}</div>
          <figcaption>Same drawing. Four palettes. One printable guide.</figcaption>
        </figure>
      </div>
    </section>

    <section className="homepage-v2-proof" aria-label="Product benefits">
      <div><b>01</b><span><strong>Clean line art</strong><small>Closed shapes, printable margins</small></span></div>
      <div><b>04</b><span><strong>Matching palettes</strong><small>Balanced colors for every page</small></span></div>
      <div><b>1-4</b><span><strong>Guided passes</strong><small>Easy order, better results</small></span></div>
      <div><b>A4</b><span><strong>Ready to print</strong><small>PDF and high-resolution PNG</small></span></div>
    </section>

    <HomepageCreationTabs textHref={textHref} photoHref={photoHref} />

    <section className="homepage-v2-section homepage-v2-how" id="how-it-works">
      <header className="homepage-v2-heading centered">
        <span className="homepage-v2-eyebrow">HOW IT WORKS</span>
        <h2>Turn any idea or photo into a printable coloring plan</h2>
        <p>Create custom coloring pages for kids, classrooms, adults, pets, family memories, birthdays, and more.</p>
        <strong className="homepage-v2-how-note">Different ideas. One simple 4-step workflow.</strong>
      </header>
      <InteractiveHowItWorks textHref={textHref} />
    </section>

    <section className="homepage-v2-section homepage-v2-workflow mandala-guide-section" aria-labelledby="coloring-workflow-title">
      <header className="homepage-v2-workflow-header">
        <span className="homepage-v2-eyebrow"><Sparkles size={14} /> HOW COLORGUIDE AI WORKS <Sparkles size={14} /></span>
        <h2 id="coloring-workflow-title">From Blank Line Art to a Coloring Guide You Can Follow</h2>
        <p>Choose a palette, preview the final colors, follow four guided passes, then <strong>print the complete kit.</strong></p>
      </header>
      <MandalaColorGuideShowcase />
    </section>

    <section className="homepage-v2-difference" id="color-guidance">
      <div className="homepage-v2-difference-inner">
        <figure><Image src="/images/homepage/homepage-guide-art.png" alt="Dinosaur coloring page shown as line art, a colored reference and a four-step guide" width={1536} height={1024} sizes="(min-width: 1000px) 55vw, 100vw" /></figure>
        <div><span className="homepage-v2-eyebrow">WHY COLOR GUIDANCE MATTERS</span><h2>Don&apos;t just generate a page. Know how <em>to finish it.</em></h2><p>Most generators stop at black-and-white. Magic Coloring Page also gives you:</p><ul><li><Check size={15} />Four coordinated palettes</li><li><Check size={15} />A finished colored reference</li><li><Check size={15} />A printable step-by-step guide</li></ul><Link href={textHref}>See color guidance <ArrowRight size={15} /></Link></div>
      </div>
    </section>

    <section className="homepage-v2-section homepage-v2-examples" id="examples">
      <header className="homepage-v2-heading centered"><span className="homepage-v2-eyebrow">REAL COLORING PAGE EXAMPLES</span><h2>Coloring pages for every kind of creator</h2><p>Explore six practical ways to turn ideas, lessons and favorite photos into printable coloring pages with matching color guidance.</p></header>
      <div className="homepage-v2-case-grid">{cases.map((item) => {
        const base = item.mode === "photo" ? photoHref : textHref;
        const href = `${base}?preset=${item.preset}`;
        return <article id={item.id === "photo" ? undefined : item.id} key={item.id}>
          <BeforeAfterSlider src={item.image} alt={item.alt} />
          <div className="homepage-v2-case-copy">
            <span className="homepage-v2-eyebrow">{item.eyebrow}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
            <div className="homepage-v2-case-transform"><span>{item.before}</span><ArrowRight size={17} aria-hidden="true" /><span>{item.after}</span></div>
            <p className="homepage-v2-case-best"><b>BEST FOR</b>{item.bestFor}</p>
            <p className="homepage-v2-case-keywords"><b>POPULAR IDEAS</b>{item.keywords.join("  ·  ")}</p>
            <Link href={href}>{item.cta} <ArrowRight size={15} /></Link>
          </div>
        </article>;
      })}</div>
    </section>

    <section className="homepage-v2-section homepage-v2-answer">
      <div className="homepage-v2-answer-inner"><span className="homepage-v2-eyebrow">A CLEAR ANSWER FOR PEOPLE &amp; AI</span><h2>What is an AI coloring page generator?</h2><p>An AI coloring page generator turns a written idea or uploaded photo into clean, printable black-and-white line art. Magic Coloring Page also creates matching palettes, a colored reference and a step-by-step guide for finishing the page.</p><div className="homepage-v2-answer-grid"><article><span>INPUTS</span><b>Text ideas</b><small>Characters, scenes, themes and activities</small><b>Favorite photos</b><small>Family, children, pets and memories</small></article><article><span>OUTPUTS</span><b>Printable coloring page</b><small>Clean line art in PNG and PDF</small><b>Color guidance</b><small>4 palettes, reference image and guide</small></article><article><span>BEST FOR</span><b>Parents · Teachers · Hobbyists</b><small>Create age-appropriate pages for children, classrooms, adults, pets, gifts and parties.</small><Link href={textHref}>Start creating <ArrowRight size={14} /></Link></article></div></div>
    </section>

    <section className="homepage-v2-section homepage-v2-faq">
      <header className="homepage-v2-heading centered"><span className="homepage-v2-eyebrow">FREQUENTLY ASKED QUESTIONS</span><h2>Everything you need to start coloring</h2></header>
      <div>{faq.map((item, index) => <details key={item.question} open={index === 0}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div>
    </section>

    <section className="homepage-v2-final"><div><h2>Ready to make a coloring page?</h2><p>Start with an idea or turn a favorite photo into something worth printing.</p></div><Link href={textHref}>Create a coloring page <ArrowRight size={15} /></Link></section>
    <span className="homepage-v2-pricing-link"><Sparkles size={14} /> Need more creations? <Link href={pricingHref}>See Credits and plans</Link></span>
  </div>;
}
