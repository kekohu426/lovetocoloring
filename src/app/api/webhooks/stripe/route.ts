import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { cradler, TABLES } from "@/lib/cradler";
import { CREDIT_PACKS } from "@/lib/config";
import { grantCredits } from "@/lib/credits";
import { stripe, webhookSecret } from "@/lib/stripe";
import type { Plan, StripeEventRecord, User } from "@/lib/types";

export const dynamic = "force-dynamic";

/** True the first time an event id is seen; false on every redelivery. */
async function claimEvent(event: Stripe.Event): Promise<boolean> {
  const seen = await cradler
    .from<StripeEventRecord>(TABLES.stripeEvents)
    .select("id")
    .eq("eventId", event.id)
    .first();

  if (seen) return false;
  await cradler.from<StripeEventRecord>(TABLES.stripeEvents).insert({ eventId: event.id, type: event.type });
  return true;
}

async function userByCustomer(customerId: string): Promise<User | null> {
  return cradler.from<User>(TABLES.users).select().eq("stripeCustomerId", customerId).first();
}

/**
 * `current_period_end` moved onto subscription items in newer API versions;
 * read whichever the account's version supplies.
 */
function periodEnd(subscription: Stripe.Subscription): string | null {
  const raw =
    (subscription as unknown as { current_period_end?: number }).current_period_end ??
    subscription.items?.data?.[0]?.current_period_end;
  return raw ? new Date(raw * 1000).toISOString() : null;
}

async function applySubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const user = await userByCustomer(customerId);
  if (!user) return;

  const active = subscription.status === "active" || subscription.status === "trialing";
  const itemId = subscription.metadata?.itemId;
  const plan: Plan = active && (itemId === "monthly" || itemId === "yearly") ? itemId : "free";

  await cradler
    .from<User>(TABLES.users)
    .update({
      plan,
      stripeSubscriptionId: active ? subscription.id : null,
      subscriptionEndsAt: active ? periodEnd(subscription) : null,
    })
    .eq("id", user.id);
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  // Signature verification needs the raw body, not the parsed JSON.
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, signature, webhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (!(await claimEvent(event))) return NextResponse.json({ ok: true, duplicate: true });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "payment") break;

      const userId = session.metadata?.userId;
      const pack = CREDIT_PACKS.find((p) => p.id === session.metadata?.itemId);
      if (userId && pack) {
        await grantCredits(userId, pack.credits, "pack_purchase", event.id);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await applySubscription(event.data.object);
      break;
    }

    case "invoice.paid": {
      // Renewal: pull the subscription fresh so the new period end is stored.
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
      const subId =
        typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription ?? null;
      if (subId) await applySubscription(await stripe().subscriptions.retrieve(subId));
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
