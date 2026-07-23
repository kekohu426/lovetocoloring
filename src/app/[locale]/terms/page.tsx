import type { Metadata } from "next";
import { FAIR_USE, SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for ${SITE.name}, including credits, subscriptions and image rights.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const sections = [
    {
      title: "Your images",
      body: `Coloring pages you generate are yours to use, including for classroom, personal and commercial purposes. You are responsible for what you upload: do not upload photos of other people without their permission, or images you do not hold the rights to.`,
    },
    {
      title: "Credits",
      body: `Credits are bought in packs and do not expire. A Standard page costs 1 credit, a Pro page 4 credits, and HD upscaling 2 credits. Generations that fail are refunded automatically — you are never charged for an image you did not receive.`,
    },
    {
      title: "Subscriptions",
      body: FAIR_USE.enabled
        ? `Unlimited plans renew automatically until cancelled, and can be cancelled at any time from the Stripe billing portal. "Unlimited" is subject to a fair-use ceiling of ${FAIR_USE.standardPerMonth.toLocaleString()} Standard and ${FAIR_USE.proPerMonth.toLocaleString()} Pro pages per calendar month, which exists to prevent automated abuse and is far above normal use.`
        : `Unlimited plans renew automatically until cancelled, and can be cancelled at any time from the Stripe billing portal.`,
    },
    {
      title: "Acceptable use",
      body: `Do not use the service to generate sexual content involving minors, hateful imagery, or content that infringes someone else's rights. Accounts used this way are closed without refund.`,
    },
    {
      title: "Availability",
      body: `The service depends on third-party image models and may be interrupted. We do not guarantee uninterrupted availability, and our liability is limited to the amount you paid in the previous three months.`,
    },
  ];

  return (
    <section className="legal-page mx-auto max-w-3xl px-5 py-10">
      <h1 className="mb-6 text-center text-[32px] font-semibold tracking-tight">Terms</h1>
      <div className="grid gap-3">
        {sections.map((section) => (
          <article key={section.title} className="card px-7 py-7 text-center">
            <h2 className="mb-2 text-[16px] font-semibold tracking-tight">{section.title}</h2>
            <p className="text-[14.5px] leading-relaxed text-muted">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
