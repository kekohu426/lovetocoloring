export const en = {
  nav: {
    menu: "Menu",
    textToColoring: "Text to Coloring Page",
    photoToColoring: "Photo to Coloring Page",
    pricing: "Pricing",
    myPages: "My pages",
    signIn: "Sign in",
    signOut: "Sign out",
    credits: "credits",
  },
  home: {
    title: "AI Coloring Page Generator",
    subtitle:
      "Turn any photo or idea into a clean, printable black-and-white coloring page in seconds. No drawing skills, no signup to try.",
    ctaPrimary: "Create a coloring page",
    trustLine: "Two free pages, no account needed. Downloads are unwatermarked.",
  },
  generator: {
    tabText: "Describe an idea",
    tabImage: "Upload a photo",
    promptLabel: "What should the page show?",
    promptPlaceholder: "A friendly dinosaur reading a book under a tree",
    promptImagePlaceholder: "Optional: anything to emphasise or simplify",
    uploadLabel: "Drop a photo here, or choose a file",
    uploadHint: "JPG or PNG, up to 10 MB. Faces, pets and objects all work.",
    sizeLabel: "Page shape",
    sizePortrait: "Portrait",
    sizeSquare: "Square",
    sizeLandscape: "Landscape",
    tierLabel: "Quality",
    tierStandard: "Standard",
    tierPro: "Pro",
    tierStandardHint: "Fast, great for most pages",
    tierProHint: "Finer detail and cleaner lines",
    submit: "Generate",
    submitting: "Drawing your page",
    download: "Download",
    hd: "Make HD",
    again: "Start over",
    costFree: "Free",
    unlimited: "Unlimited",
    freeLeft: "{n} left",
    resultPlaceholder: "Your coloring page appears here",
    hdReady: "HD ready",
    // Plain strings, not functions: the dictionary crosses into a Client
    // Component, and functions cannot be serialised over that boundary.
    costCreditsOne: "{n} credit",
    costCreditsMany: "{n} credits",
  },
  myPages: {
    signInPrompt: "Sign in to see the pages you have made.",
    empty: "You have not made a coloring page yet.",
    preview: "Open full-size image",
    download: "Download",
    print: "Print",
  },
  steps: {
    title: "How it works",
    items: [
      {
        title: "Describe it or upload it",
        body: "Type what you want to colour, or upload a photo of a pet, a child or a favourite toy.",
      },
      {
        title: "The AI draws clean outlines",
        body: "Colour, shading and background clutter are stripped away, leaving bold lines built for crayons.",
      },
      {
        title: "Print or make it HD",
        body: "Download straight away, or upscale first for a crisp full-page print.",
      },
    ],
  },
  features: {
    title: "Built for pages people actually print",
    items: [
      {
        title: "Photo to coloring page",
        body: "Upload a real photo and keep the pose and features you recognise, redrawn as simple outlines.",
      },
      {
        title: "Text to coloring page",
        body: "Describe any scene, animal or pattern. The prompt is tuned for line art, so you never get a shaded painting.",
      },
      {
        title: "HD for printing",
        body: "Upscale a finished page so the lines stay sharp at full paper size instead of turning soft and grey.",
      },
      {
        title: "Print-ready shapes",
        body: "Portrait, square and landscape, each with generous white margins that survive a printer's edges.",
      },
    ],
  },
  showcase: {
    title: "What people make with it",
    subtitle:
      "Six of the things this AI coloring page generator gets asked for most, and how each one turns out.",
    items: [
      {
        eyebrow: "Coloring pages for kids",
        title: "Simple shapes small hands can actually colour",
        body: "Coloring pages for kids work best with big open areas and few tiny details. Ask for one clear subject and the generator keeps the shapes large and the outlines bold, so a three-year-old with a fat crayon can stay inside the lines.",
        image: "/showcase/flower.svg",
        alt: "A flower in a pot drawn as a simple black-and-white coloring page",
      },
      {
        eyebrow: "Pet photo to coloring page",
        title: "Your own dog or cat, redrawn as line art",
        body: "Upload a photo of your pet and it comes back as outlines. Fur texture and background clutter are stripped away, but the pose, the ear shape and the face stay recognisable — which is what makes it a keepsake rather than a generic animal page.",
        image: "/showcase/cat.svg",
        alt: "A sitting cat drawn as a black-and-white coloring page",
      },
      {
        eyebrow: "Mandala coloring pages",
        title: "Symmetrical patterns for adult colouring",
        body: "Mandala coloring pages are the most requested style for adults. Ask for a mandala and you get concentric, evenly spaced petal rings with enough separate regions to keep a set of pencils busy for an evening.",
        image: "/showcase/mandala.svg",
        alt: "A symmetrical mandala drawn as a black-and-white coloring page",
      },
      {
        eyebrow: "Dinosaur coloring pages",
        title: "Animals that hold a child's attention",
        body: "Dinosaurs, unicorns and sea creatures are the classic requests. Name the animal and, if you like, what it is doing — the generator draws it in profile with a clean silhouette, which colours in far better than a busy three-quarter view.",
        image: "/showcase/dino.svg",
        alt: "A long-necked dinosaur drawn as a black-and-white coloring page",
      },
      {
        eyebrow: "Printable pages for the classroom",
        title: "Worksheets built around one lesson",
        body: "Teachers use it to make a page that matches what they are teaching that week rather than whatever a stock site happens to have. Generate a butterfly for a life-cycle lesson, print a class set, and the whole thing takes about a minute.",
        image: "/showcase/butterfly.svg",
        alt: "A butterfly drawn as a black-and-white coloring page",
      },
      {
        eyebrow: "Custom coloring pages",
        title: "Anything you can describe in a sentence",
        body: "Houses, vehicles, birthday scenes, a favourite toy — if you can write it down, you can print it. Describing one subject and a simple setting gives a much better page than a long, crowded description.",
        image: "/showcase/house.svg",
        alt: "A cottage with a sun drawn as a black-and-white coloring page",
      },
    ],
  },
  faq: {
    title: "Questions",
    items: [
      {
        q: "What is an AI coloring page generator?",
        a: "An AI coloring page generator turns a written description or an uploaded photo into black-and-white line art you can print and colour in. Magic Coloring Page removes colour, shading and background detail, leaving bold clean outlines suitable for crayons, pencils or markers.",
      },
      {
        q: "Can I turn my own photo into a coloring page?",
        a: "Yes. Upload a JPG or PNG and the generator redraws the subject as outlines, keeping the pose and recognisable features while simplifying textures. It works well for pets, portraits, toys and landmarks.",
      },
      {
        q: "Is it free?",
        a: "Every visitor gets two free coloring pages without creating an account, and the downloads carry no watermark. After that you can buy a credit pack or subscribe for unlimited pages.",
      },
      {
        q: "Are the pages good enough to print?",
        a: "Yes. Pages are generated at 1024x1536 for portrait prints, and the HD option upscales a finished page so the lines stay sharp at A4 or Letter size.",
      },
      {
        q: "Can I use the coloring pages commercially?",
        a: "Pages you generate are yours to use, including in classrooms, printables and products you sell. Do not upload photos of people without their permission, or images you do not have the rights to.",
      },
      {
        q: "What makes a good coloring page prompt?",
        a: "Name one clear subject and a simple setting, for example 'a friendly dinosaur reading a book under a tree'. Fewer, larger shapes colour in better than busy scenes, so avoid crowds, heavy texture and complex backgrounds.",
      },
    ],
  },
  pricing: {
    title: "Pricing",
    subtitle: "Buy credits once, or subscribe for unlimited pages.",
    packsTitle: "Credit packs",
    packsNote: "Credits never expire.",
    plansTitle: "Unlimited",
    monthly: "per month",
    yearly: "per year",
    buy: "Buy",
    subscribe: "Subscribe",
    popular: "Most popular",
    creditsUnit: "credits",
    costTable: "Standard page 1 credit · Pro page 4 credits · HD 2 credits",
    fairUse:
      "Unlimited plans are subject to a fair-use ceiling that only heavy automated use would reach.",
  },
  footer: {
    privacy: "Privacy",
    terms: "Terms",
    rights: "All rights reserved.",
  },
  errors: {
    insufficient: "You are out of credits. Top up to keep generating.",
    fairUse: "You have reached this month's fair-use limit for that quality.",
    freeUsed: "You have used your free pages. Sign in to keep going.",
    generic: "Something went wrong. No credits were charged — please try again.",
  },
} as const;

export type Dictionary = typeof en;
