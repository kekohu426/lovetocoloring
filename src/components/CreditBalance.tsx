"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface BalancePayload {
  signedIn: boolean;
  credits: number;
  unlimited: boolean;
}

export const CREDIT_BALANCE_EVENT = "credit-balance-changed";

export function notifyCreditBalanceChanged() {
  window.dispatchEvent(new Event(CREDIT_BALANCE_EVENT));
}

export function CreditBalance({
  initialCredits,
  initialUnlimited,
  creditsLabel,
  unlimitedLabel,
  href,
}: {
  initialCredits: number;
  initialUnlimited: boolean;
  creditsLabel: string;
  unlimitedLabel: string;
  href: string;
}) {
  const pathname = usePathname();
  const [credits, setCredits] = useState(initialCredits);
  const [unlimited, setUnlimited] = useState(initialUnlimited);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/me", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as BalancePayload;
    if (!payload.signedIn) return;
    setCredits(payload.credits);
    setUnlimited(payload.unlimited);
  }, []);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const handleChange = () => void refresh();
    window.addEventListener(CREDIT_BALANCE_EVENT, handleChange);
    window.addEventListener("focus", handleChange);
    return () => {
      window.removeEventListener(CREDIT_BALANCE_EVENT, handleChange);
      window.removeEventListener("focus", handleChange);
    };
  }, [refresh]);

  const label = credits === 1 ? creditsLabel.replace(/s$/, "") : creditsLabel;
  return <Link className="credit-chip" href={href}>{unlimited ? unlimitedLabel : `${credits} ${label}`}</Link>;
}
