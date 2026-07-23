import type { Metadata } from "next";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { CREDIT_PACKS, FAIR_USE, PLANS, SITE } from "@/lib/config";
import { BuyButton } from "@/components/BuyButton";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Buy coloring page credits once, or subscribe for unlimited AI coloring pages. Credits never expire and every download is watermark free.",
  alternates: { canonical: "/pricing" },
};

function money(usd: number) {
  return Number.isInteger(usd) ? `$${usd}` : `$${usd.toFixed(2)}`;
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(isLocale(locale) ? (locale as Locale) : "en");

  return (
    <main className="pricing-page">
      <section className="pricing-hero mx-auto max-w-5xl px-5 pb-8 pt-10 text-center sm:pt-14">
        <h1 className="text-[34px] font-semibold tracking-tight sm:text-[40px]">{t.pricing.title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-[16px] leading-relaxed text-muted">{t.pricing.subtitle}</p>
        <p className="mt-3 text-[13px] text-faint">{t.pricing.costTable}</p>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-6">
        <h2 className="mb-4 text-center text-[15px] font-medium text-muted">{t.pricing.packsTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <article key={pack.id} className="card flex flex-col px-7 py-7 text-center">
              {/* Slot is always rendered so prices stay on one baseline across cards. */}
              <div className="mb-3 h-[24px]">
                {"highlight" in pack && pack.highlight ? (
                  <span className="inline-block rounded-[var(--radius-pill)] bg-primary px-3 py-1 text-[11.5px] font-semibold leading-none text-on-primary">
                    {t.pricing.popular}
                  </span>
                ) : null}
              </div>
              <p className="text-[32px] font-semibold tracking-tight">{money(pack.usd)}</p>
              <p className="mt-1 text-[14px] text-muted">
                {pack.credits} {t.pricing.creditsUnit}
              </p>
              <p className="mb-6 mt-1 text-[12.5px] text-faint">{t.pricing.packsNote}</p>
              <div className="mt-auto">
                <BuyButton
                  kind="pack"
                  id={pack.id}
                  label={t.pricing.buy}
                  emphasis={"highlight" in pack && pack.highlight}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-10">
        <h2 className="mb-4 text-center text-[15px] font-medium text-muted">{t.pricing.plansTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <article key={plan.id} className="card flex flex-col px-7 py-7 text-center">
              <p className="text-[32px] font-semibold tracking-tight">{money(plan.usd)}</p>
              <p className="mb-6 mt-1 text-[14px] text-muted">
                {plan.interval === "month" ? t.pricing.monthly : t.pricing.yearly}
              </p>
              <div className="mt-auto">
                <BuyButton kind="plan" id={plan.id} label={t.pricing.subscribe} emphasis={plan.id === "monthly"} />
              </div>
            </article>
          ))}
        </div>
        {FAIR_USE.enabled ? (
          <p className="mx-auto mt-4 max-w-2xl text-center text-[12.5px] leading-relaxed text-faint">
            {t.pricing.fairUse} Currently {FAIR_USE.standardPerMonth.toLocaleString()} Standard and{" "}
            {FAIR_USE.proPerMonth.toLocaleString()} Pro pages per month.
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-14">
        <div className="card px-7 py-6 text-center text-[13px] text-faint">
          Payments are handled by Stripe. {SITE.name} never sees your card details.
        </div>
      </section>
    </main>
  );
}
