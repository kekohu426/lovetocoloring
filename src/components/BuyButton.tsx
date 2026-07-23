"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function BuyButton({
  kind,
  id,
  label,
  emphasis,
}: {
  kind: "pack" | "plan";
  id: string;
  label: string;
  emphasis?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      await signIn("google");
      return;
    }
    if (!res.ok || !data.url) {
      setError(data.error ?? "Could not start checkout.");
      setBusy(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className={`w-full cursor-pointer rounded-[var(--radius-inner)] px-5 py-3.5 text-[14px] font-semibold transition-colors disabled:opacity-40 ${
          emphasis
            ? "bg-primary text-on-primary hover:bg-primary-hover"
            : "bg-well text-ink hover:bg-page"
        }`}
      >
        {busy ? "Opening checkout" : label}
      </button>
      {error ? <p className="mt-2 text-center text-[12.5px] text-faint">{error}</p> : null}
    </>
  );
}
