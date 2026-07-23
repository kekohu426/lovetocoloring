import "server-only";
import { cradler, TABLES } from "./cradler";
import { FAIR_USE, type Tier } from "./config";
import { findUserById, writeLedger } from "./users";
import type { Generation, LedgerReason, User } from "./types";

export function isSubscribed(user: User): boolean {
  if (user.plan === "free") return false;
  if (!user.subscriptionEndsAt) return false;
  return new Date(user.subscriptionEndsAt).getTime() > Date.now();
}

/**
 * Counts a subscriber's generations in the current calendar month.
 * Only called for subscribers, so it stays off the hot path for credit users.
 */
async function monthlyUsage(userId: string, tier: Tier): Promise<number> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const { count } = await cradler
    .from<Generation>(TABLES.generations)
    .select("id")
    .eq("userId", userId)
    .eq("tier", tier)
    .neq("status", "failed")
    .gte("createdAt", start.toISOString());

  return count;
}

export type SpendResult =
  | { ok: true; charged: number; balance: number }
  | { ok: false; reason: "insufficient_credits" | "fair_use_exceeded"; balance: number };

/**
 * Charges a user for one action.
 *
 * Subscribers pay nothing but are checked against the fair-use ceiling; credit
 * users are debited. Cradler has no transactions, so the debit is a
 * read-modify-write guarded by a `gte` filter: two requests firing within the
 * same few milliseconds can still both succeed on one balance. The exposure is
 * one action's worth of credits per race, which is cheaper than serialising
 * every generation — revisit if abuse shows up in the ledger.
 */
export async function spendCredits(
  userId: string,
  cost: number,
  reason: LedgerReason,
  refId: string | null,
  tier?: Tier,
): Promise<SpendResult> {
  const user = await findUserById(userId);
  if (!user) return { ok: false, reason: "insufficient_credits", balance: 0 };

  if (isSubscribed(user)) {
    if (FAIR_USE.enabled && tier) {
      const cap = tier === "pro" ? FAIR_USE.proPerMonth : FAIR_USE.standardPerMonth;
      if ((await monthlyUsage(userId, tier)) >= cap) {
        return { ok: false, reason: "fair_use_exceeded", balance: user.credits };
      }
    }
    return { ok: true, charged: 0, balance: user.credits };
  }

  if (user.credits < cost) {
    return { ok: false, reason: "insufficient_credits", balance: user.credits };
  }

  const balance = user.credits - cost;
  const { count } = await cradler
    .from<User>(TABLES.users)
    .update({ credits: balance })
    .eq("id", userId)
    .gte("credits", cost);

  if (count === 0) return { ok: false, reason: "insufficient_credits", balance: user.credits };

  await writeLedger(userId, -cost, reason, refId, balance);
  return { ok: true, charged: cost, balance };
}

/** Gives credits back when a generation fails upstream — failures are not billed. */
export async function refundCredits(userId: string, amount: number, refId: string): Promise<void> {
  if (amount <= 0) return;
  const user = await findUserById(userId);
  if (!user) return;

  const balance = user.credits + amount;
  await cradler.from<User>(TABLES.users).update({ credits: balance }).eq("id", userId);
  await writeLedger(userId, amount, "refund", refId, balance);
}

export async function grantCredits(
  userId: string,
  amount: number,
  reason: LedgerReason,
  refId: string | null,
): Promise<void> {
  const user = await findUserById(userId);
  if (!user) return;

  const balance = user.credits + amount;
  await cradler.from<User>(TABLES.users).update({ credits: balance }).eq("id", userId);
  await writeLedger(userId, amount, reason, refId, balance);
}
