/**
 * Single source of truth for pricing, credit costs and abuse limits.
 * Changing a price here means changing it in Stripe too — the Price IDs
 * live in env vars so this file stays deploy-independent.
 */

export const SITE = {
  name: "Magic Coloring Page",
  /** Swap for the real domain once it is registered. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://magiccoloringpage.com",
  tagline: "AI Coloring Page Generator",
} as const;

/** What each action costs a signed-in user, in credits. */
export const CREDIT_COST = {
  generateStandard: 1,
  generatePro: 4,
  upscale: 2,
  coloringKit: 1,
} as const;

/** Credits handed to a user the first time they sign in with Google. */
export const SIGNUP_BONUS_CREDITS = 5;

/**
 * Free generations for visitors who have not signed in yet, keyed by device.
 * Output is unwatermarked and downloadable — the cap is the only gate.
 */
export const ANON_FREE_GENERATIONS = 2;

export type Tier = "standard" | "pro";

export const TIERS: Record<Tier, { model: string; imageModel: string; label: string; cost: number }> = {
  standard: {
    model: "sparkpix-image",
    imageModel: "sparkpix-image-edit",
    label: "Standard",
    cost: CREDIT_COST.generateStandard,
  },
  pro: {
    model: "grok-imagine-pro/grok-imagine-image-pro",
    imageModel: "grok-imagine-pro/grok-imagine-image-pro",
    label: "Pro",
    cost: CREDIT_COST.generatePro,
  },
};

/** One-time credit packs. `priceId` is read from env so test/live keys can differ. */
export const CREDIT_PACKS = [
  { id: "starter", credits: 150, usd: 9.9, priceIdEnv: "STRIPE_PRICE_PACK_STARTER" },
  { id: "popular", credits: 450, usd: 24.9, priceIdEnv: "STRIPE_PRICE_PACK_POPULAR", highlight: true },
  { id: "pro", credits: 1100, usd: 49.9, priceIdEnv: "STRIPE_PRICE_PACK_PRO" },
] as const;

export const PLANS = [
  { id: "monthly", usd: 19.9, interval: "month", priceIdEnv: "STRIPE_PRICE_SUB_MONTHLY" },
  { id: "yearly", usd: 159, interval: "year", priceIdEnv: "STRIPE_PRICE_SUB_YEARLY" },
] as const;

/**
 * Subscriptions are sold as "unlimited". These caps exist so a single account
 * cannot outrun the API bill — at $0.10/image a Pro-spamming subscriber goes
 * cash-negative around 200 images/month. Over the cap we degrade rather than
 * hard-block. Set `FAIR_USE.enabled = false` to sell truly uncapped.
 */
export const FAIR_USE = {
  enabled: true,
  standardPerMonth: 1500,
  proPerMonth: 200,
} as const;

export function priceIdFor(envKey: string): string {
  const id = process.env[envKey];
  if (!id) throw new Error(`Missing Stripe price id: set ${envKey}`);
  return id;
}
