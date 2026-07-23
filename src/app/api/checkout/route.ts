import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cradler, TABLES } from "@/lib/cradler";
import { CREDIT_PACKS, PLANS, SITE, priceIdFor } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { findUserById } from "@/lib/users";
import type { User } from "@/lib/types";

/**
 * Starts Stripe Checkout for a credit pack or a subscription.
 *
 * Credits are granted by the webhook, never here — a user who closes the tab
 * before the redirect must still get what they paid for.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in to buy.", code: "signin_required" }, { status: 401 });
  }

  const user = await findUserById(userId);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const kind = body?.kind === "plan" ? "plan" : "pack";
  const id = String(body?.id ?? "");

  const pack = CREDIT_PACKS.find((p) => p.id === id);
  const plan = PLANS.find((p) => p.id === id);
  if (kind === "pack" ? !pack : !plan) {
    return NextResponse.json({ error: "Unknown item." }, { status: 400 });
  }

  const client = stripe();

  // Reuse the Stripe customer so subscriptions and packs share a billing record.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await client.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await cradler.from<User>(TABLES.users).update({ stripeCustomerId: customerId }).eq("id", user.id);
  }

  const checkout = await client.checkout.sessions.create({
    mode: kind === "pack" ? "payment" : "subscription",
    customer: customerId,
    line_items: [{ price: priceIdFor(kind === "pack" ? pack!.priceIdEnv : plan!.priceIdEnv), quantity: 1 }],
    success_url: `${SITE.url}/?checkout=success`,
    cancel_url: `${SITE.url}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
    // Read back by the webhook to decide who gets what.
    metadata: { userId: user.id, kind, itemId: id, credits: String(pack?.credits ?? 0) },
    ...(kind === "plan"
      ? { subscription_data: { metadata: { userId: user.id, itemId: id } } }
      : { payment_intent_data: { metadata: { userId: user.id, itemId: id } } }),
  });

  return NextResponse.json({ url: checkout.url });
}
