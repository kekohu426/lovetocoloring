"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Camera, CircleDollarSign, FileText, FolderOpen, Grid2X2, Menu, Palette, X, type LucideIcon } from "lucide-react";

export type MobileNavIcon = "text" | "photo" | "palette" | "examples" | "pricing" | "pages";

export interface MobileNavItem {
  href: string;
  label: string;
  icon: MobileNavIcon;
}

const navIcons: Record<MobileNavIcon, LucideIcon> = {
  text: FileText,
  photo: Camera,
  palette: Palette,
  examples: Grid2X2,
  pricing: CircleDollarSign,
  pages: FolderOpen,
};

export function MobileNavMenu({ label, items }: { label: string; items: MobileNavItem[] }) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    }

    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);

  return (
    <div ref={container} className="relative lg:hidden">
      <button
        ref={trigger}
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
        className="mobile-nav-trigger flex size-11 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-well hover:text-ink"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open ? (
        <nav
          id="mobile-navigation"
          aria-label={label}
          className="mobile-navigation absolute right-0 top-12 w-[min(17rem,calc(100vw-2rem))] rounded-[var(--radius-inner)] bg-card p-2 shadow-lift"
        >
          {items.map((item) => {
            const Icon = navIcons[item.icon];
            return <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="mobile-navigation-link flex items-center gap-3 rounded-[12px] px-3 py-3 text-[13.5px] font-medium text-muted transition-colors hover:bg-well hover:text-ink"
            >
              <span><Icon size={16} strokeWidth={1.9} /></span>{item.label}
            </Link>;
          })}
        </nav>
      ) : null}
    </div>
  );
}
