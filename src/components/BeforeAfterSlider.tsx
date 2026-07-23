"use client";

import { useEffect, useRef } from "react";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  src: string;
  alt: string;
}

function SplitImage({ src, side, alt }: { src: string; side: "before" | "after"; alt?: string }) {
  const viewBox = side === "before" ? "0 0 1 2" : "1 0 1 2";

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" role={alt ? "img" : undefined} aria-label={alt} aria-hidden={alt ? undefined : true}>
      <image href={src} width="2" height="2" preserveAspectRatio="none" />
    </svg>
  );
}

export function BeforeAfterSlider({ src, alt }: BeforeAfterSliderProps) {
  const root = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const animation = useRef<number | null>(null);
  const interacted = useRef(false);

  function setPosition(value: number) {
    const position = Math.min(80, Math.max(20, value));
    root.current?.style.setProperty("--before-position", `${position}%`);
    if (range.current) range.current.value = String(position);
  }

  function stopAnimation() {
    interacted.current = true;
    if (animation.current !== null) cancelAnimationFrame(animation.current);
  }

  useEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || interacted.current) return;
      observer.disconnect();
      const startedAt = performance.now() + 250;
      const duration = 2300;
      const keyframes = [50, 42, 58, 50];

      function frame(now: number) {
        if (interacted.current) return;
        const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
        const segment = Math.min(keyframes.length - 2, Math.floor(progress * (keyframes.length - 1)));
        const local = progress * (keyframes.length - 1) - segment;
        const eased = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
        setPosition(keyframes[segment] + (keyframes[segment + 1] - keyframes[segment]) * eased);
        if (progress < 1) animation.current = requestAnimationFrame(frame);
      }

      animation.current = requestAnimationFrame(frame);
    }, { threshold: 0.45 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (animation.current !== null) cancelAnimationFrame(animation.current);
    };
  }, []);

  return (
    <div ref={root} className="homepage-v2-case-visual" style={{ "--before-position": "50%" } as React.CSSProperties}>
      <div className="before-after-layer after"><SplitImage src={src} side="after" /></div>
      <div className="before-after-layer before"><SplitImage src={src} side="before" alt={alt} /></div>
      <span className="before-after-label before-label">BEFORE</span>
      <span className="before-after-label after-label">AFTER</span>
      <div className="before-after-divider" aria-hidden="true"><span><MoveHorizontal size={19} /></span></div>
      <input
        ref={range}
        className="before-after-range"
        type="range"
        min="20"
        max="80"
        defaultValue="50"
        aria-label={`Compare before and after: ${alt}`}
        onPointerDown={stopAnimation}
        onKeyDown={stopAnimation}
        onInput={(event) => {
          stopAnimation();
          setPosition(Number(event.currentTarget.value));
        }}
      />
    </div>
  );
}
