import "server-only";
import { cradler, TABLES } from "./cradler";
import { SIGNUP_BONUS_CREDITS } from "./config";
import type { CreditLedgerEntry, LedgerReason, User } from "./types";

export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  return cradler.from<User>(TABLES.users).select().eq("googleId", googleId).first();
}

export async function findUserById(id: string): Promise<User | null> {
  return cradler.from<User>(TABLES.users).select().eq("id", id).first();
}

/** Creates the user on first Google sign-in, granting the signup bonus. */
export async function upsertGoogleUser(profile: {
  googleId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<User> {
  const existing = await findUserByGoogleId(profile.googleId);

  if (existing) {
    // Keep the display fields fresh — people change their Google avatar.
    await cradler
      .from<User>(TABLES.users)
      .update({ email: profile.email, name: profile.name ?? null, avatarUrl: profile.avatarUrl ?? null })
      .eq("id", existing.id);
    return { ...existing, ...profile };
  }

  const { rows } = await cradler.from<User>(TABLES.users).insert({
    googleId: profile.googleId,
    email: profile.email,
    name: profile.name ?? null,
    avatarUrl: profile.avatarUrl ?? null,
    credits: SIGNUP_BONUS_CREDITS,
    plan: "free",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionEndsAt: null,
  });

  const created = rows[0];
  await writeLedger(created.id, SIGNUP_BONUS_CREDITS, "signup_bonus", null, SIGNUP_BONUS_CREDITS);
  return created;
}

export async function writeLedger(
  userId: string,
  delta: number,
  reason: LedgerReason,
  refId: string | null,
  balanceAfter: number,
): Promise<void> {
  await cradler
    .from<CreditLedgerEntry>(TABLES.creditLedger)
    .insert({ userId, delta, reason, refId, balanceAfter });
}
