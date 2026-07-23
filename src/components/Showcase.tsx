import Image from "next/image";
import type { Dictionary } from "@/i18n";

/**
 * Six worked examples, alternating image-left / image-right.
 *
 * Each block is a long-tail landing target in miniature: the eyebrow carries
 * the keyword, and the body answers the question behind it in a single
 * self-contained paragraph an answer engine can quote whole.
 */
export function Showcase({ t }: { t: Dictionary }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-10">
      <header className="mx-auto mb-6 max-w-2xl text-center">
        <h2 className="text-[26px] font-semibold tracking-tight sm:text-[30px]">{t.showcase.title}</h2>
        <p className="mx-auto mt-3 text-[15px] leading-relaxed text-muted">{t.showcase.subtitle}</p>
      </header>

      <div className="grid gap-3">
        {t.showcase.items.map((item, i) => (
          <article
            key={item.eyebrow}
            className="card grid items-center gap-6 p-6 sm:grid-cols-2 sm:gap-9 sm:p-9"
          >
            {/* Odd rows put the drawing on the right. `order` only kicks in at
                sm+, so on mobile the image always leads. */}
            <div className={`well overflow-hidden p-4 ${i % 2 === 1 ? "sm:order-2" : ""}`}>
              <Image
                src={item.image}
                alt={item.alt}
                width={400}
                height={500}
                className="mx-auto h-auto w-full max-w-[300px] rounded-[12px]"
              />
            </div>

            <div className={i % 2 === 1 ? "sm:order-1" : ""}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.09em] text-primary">
                {item.eyebrow}
              </p>
              <h3 className="mb-3 mt-2 text-[20px] font-semibold leading-snug tracking-tight">
                {item.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-muted">{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
