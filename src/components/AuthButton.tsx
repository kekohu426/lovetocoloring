"use client";

import { signIn, signOut } from "next-auth/react";

export function AuthButton({
  signedIn,
  labels,
}: {
  signedIn: boolean;
  labels: { signIn: string; signOut: string };
}) {
  if (signedIn) {
    return (
      <button
        type="button"
        onClick={() => signOut()}
        className="cursor-pointer whitespace-nowrap rounded-[var(--radius-pill)] px-4 py-1.5 text-[14px] font-medium text-muted transition-colors hover:bg-well hover:text-ink"
      >
        {labels.signOut}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="cursor-pointer whitespace-nowrap rounded-[var(--radius-pill)] bg-primary px-5 py-2 text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
    >
      {labels.signIn}
    </button>
  );
}
