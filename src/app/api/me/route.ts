import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isSubscribed } from "@/lib/credits";
import { clientIp, deviceCookie, freeGenerationsLeft, getDeviceId } from "@/lib/device";
import { findUserById } from "@/lib/users";
import { TIERS } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Everything the generator needs to show the right cost and CTA. */
export async function GET(req: Request) {
  const session = await auth();
  const { deviceId, shouldSet } = await getDeviceId();
  const user = session?.user?.id ? await findUserById(session.user.id) : null;

  const payload = user
    ? {
        signedIn: true as const,
        credits: user.credits,
        unlimited: isSubscribed(user),
        freeLeft: 0,
        costs: { standard: TIERS.standard.cost, pro: TIERS.pro.cost },
      }
    : {
        signedIn: false as const,
        credits: 0,
        unlimited: false,
        freeLeft: await freeGenerationsLeft(deviceId, clientIp(req)),
        costs: { standard: TIERS.standard.cost, pro: TIERS.pro.cost },
      };

  const res = NextResponse.json(payload);
  if (shouldSet) res.cookies.set(deviceCookie(deviceId));
  return res;
}
