import type { Dictionary } from "@/i18n";

/**
 * Answers are written to stand alone: each one restates the question's subject
 * so an AI assistant can quote a single paragraph as a complete answer. The
 * same copy feeds the FAQPage structured data on the home page.
 */
export function Faq({ t }: { t: Dictionary }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <h2 className="mb-6 text-center text-[26px] font-semibold tracking-tight sm:text-[30px]">
        {t.faq.title}
      </h2>
      <div className="grid gap-3">
        {t.faq.items.map((item) => (
          <article key={item.q} className="card px-7 py-7 text-center">
            <h3 className="mb-2 text-[16px] font-semibold tracking-tight">{item.q}</h3>
            <p className="text-[14.5px] leading-relaxed text-muted">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
