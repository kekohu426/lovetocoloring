import "server-only";
import { createClient } from "@cradler/sdk";

type Client = ReturnType<typeof createClient>;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

let instance: Client | null = null;

function client(): Client {
  if (!instance) {
    instance = createClient({
      url: process.env.CRADLER_URL ?? "https://gateway.cradler.ai",
      projectId: required("CRADLER_PROJECT_ID"),
      apiKey: required("CRADLER_SERVICE_KEY"),
    });
  }
  return instance;
}

/**
 * Server-side Cradler client, holding the **service** key. Every read and write
 * goes through our own API routes, so the anon key is never needed in the
 * browser and table permissions stay locked down.
 *
 * Construction is deferred behind a proxy: `next build` imports every route
 * module to collect page data, and a client built at import time would abort
 * the build on any machine without the keys.
 */
export const cradler: Client = new Proxy({} as Client, {
  get(_target, prop) {
    const value = Reflect.get(client() as object, prop);
    return typeof value === "function" ? value.bind(client()) : value;
  },
});

export const TABLES = {
  users: "users",
  generations: "generations",
  creditLedger: "credit_ledger",
  freeUsage: "free_usage",
  stripeEvents: "stripe_events",
  coloringKits: "coloring_kits",
} as const;
