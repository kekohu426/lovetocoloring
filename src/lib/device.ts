import "server-only";
import { cookies } from "next/headers";
import { cradler, TABLES } from "./cradler";
import { ANON_FREE_GENERATIONS } from "./config";
import type { FreeUsage } from "./types";

const COOKIE = "mcp_device";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Identifies a signed-out visitor so their free generations can be counted.
 * Returns `shouldSet` when a new id was minted — route handlers must write it
 * onto the response, since a Server Component cannot set cookies.
 */
export async function getDeviceId(): Promise<{ deviceId: string; shouldSet: boolean }> {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing) return { deviceId: existing, shouldSet: false };
  return { deviceId: crypto.randomUUID(), shouldSet: true };
}

export function deviceCookie(deviceId: string) {
  return {
    name: COOKIE,
    value: deviceId,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  };
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * How many free runs this visitor has left.
 *
 * Counted against the device cookie *and* the IP, taking whichever is higher —
 * clearing cookies alone should not reset the allowance. It is not
 * unbeatable (a VPN plus a fresh profile wins), but free output here is
 * unwatermarked and downloadable, so the cap is the only thing standing
 * between an anonymous visitor and an unbounded API bill.
 */
export async function freeGenerationsLeft(deviceId: string, ip: string): Promise<number> {
  const byDevice = await cradler.from<FreeUsage>(TABLES.freeUsage).select().eq("deviceId", deviceId).first();

  let used = byDevice?.count ?? 0;

  if (ip !== "unknown") {
    const { rows } = await cradler.from<FreeUsage>(TABLES.freeUsage).select("count").eq("ip", ip);
    const byIp = rows.reduce((sum, row) => sum + (row.count ?? 0), 0);
    used = Math.max(used, byIp);
  }

  return Math.max(0, ANON_FREE_GENERATIONS - used);
}

export async function consumeFreeGeneration(deviceId: string, ip: string): Promise<void> {
  const existing = await cradler.from<FreeUsage>(TABLES.freeUsage).select().eq("deviceId", deviceId).first();

  if (existing) {
    await cradler
      .from<FreeUsage>(TABLES.freeUsage)
      .update({ count: existing.count + 1 })
      .eq("id", existing.id);
    return;
  }

  await cradler.from<FreeUsage>(TABLES.freeUsage).insert({ deviceId, ip, count: 1 });
}

/** Hands a free run back when the upstream task never started. */
export async function releaseFreeGeneration(deviceId: string): Promise<void> {
  const existing = await cradler.from<FreeUsage>(TABLES.freeUsage).select().eq("deviceId", deviceId).first();
  if (!existing || existing.count <= 0) return;

  await cradler
    .from<FreeUsage>(TABLES.freeUsage)
    .update({ count: existing.count - 1 })
    .eq("id", existing.id);
}
