import type { Tier } from "./config";

export type Plan = "free" | "monthly" | "yearly";

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  googleId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  credits: number;
  plan: Plan;
  /** Stripe customer id, set on first checkout. */
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  /** ISO date the current subscription period ends; null when not subscribed. */
  subscriptionEndsAt: string | null;
}

export type GenerationMode = "text" | "image";
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export interface Generation {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Null for anonymous visitors — `deviceId` identifies them instead. */
  userId: string | null;
  deviceId: string;
  mode: GenerationMode;
  tier: Tier;
  model: string;
  /** The user's own words, before the coloring-page template wraps them. */
  prompt: string;
  /** Storage path of the uploaded source image, for `mode: "image"`. */
  sourcePath: string | null;
  status: GenerationStatus;
  /** Upstream task id at apimodels.app. */
  taskId: string | null;
  /** Random token embedded in the callback URL, used to authenticate webhooks. */
  callbackToken: string;
  /** Public CDN path of the finished line art, once mirrored into storage. */
  resultPath: string | null;
  /** Public CDN path of the upscaled version, once requested. */
  upscaledPath: string | null;
  failMsg: string | null;
  /** Credits actually deducted; 0 for anonymous free runs. */
  creditsSpent: number;
  presetId?: string | null;
  settingsJson?: string | null;
  size?: "portrait" | "square" | "landscape" | null;
  paletteOptionsJson?: string | null;
}

export type ColoringKitStatus = "pending" | "processing" | "completed" | "failed";

export interface ColoringKit {
  id: string;
  createdAt: string;
  updatedAt: string;
  generationId: string;
  userId: string;
  clientRequestId: string;
  paletteId: string;
  paletteJson: string;
  model: string;
  status: ColoringKitStatus;
  coloredPath: string | null;
  stepPathsJson: string | null;
  guideJson: string | null;
  failMsg: string | null;
  creditsSpent: number;
}

export interface ColoringGuideStep {
  title: string;
  colors: string[];
  regionCount: number;
  addedPixelRatio: number;
  hints: string[];
}

export interface ColoringGuideDocument {
  version: 3;
  engine: "region-v3" | "palette-fallback";
  steps: ColoringGuideStep[];
  focusPaths?: string[];
}

export type LedgerReason =
  | "signup_bonus"
  | "pack_purchase"
  | "subscription_grant"
  | "test_grant"
  | "generate"
  | "upscale"
  | "coloring_kit"
  | "refund";

export interface CreditLedgerEntry {
  id: string;
  createdAt: string;
  userId: string;
  /** Positive to grant, negative to spend. */
  delta: number;
  reason: LedgerReason;
  /** Generation id, Stripe event id, etc. */
  refId: string | null;
  balanceAfter: number;
}

export interface FreeUsage {
  id: string;
  createdAt: string;
  updatedAt: string;
  deviceId: string;
  /** Recorded so clearing the device cookie does not reset the free allowance. */
  ip: string;
  count: number;
}

/** Processed Stripe events, so a redelivered webhook cannot double-credit. */
export interface StripeEventRecord {
  id: string;
  createdAt: string;
  eventId: string;
  type: string;
}
