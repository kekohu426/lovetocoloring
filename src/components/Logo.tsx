export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="brand-mark brand-mark-image shrink-0"
      style={{ width: size, height: size }}
    >
      <img src="/brand/magic-coloring-logo.png" alt="" />
    </span>
  );
}

export function Logo({ name }: { name: string }) {
  const [firstWord, ...rest] = name.split(" ");

  return (
    <span className="brand-lockup">
      <LogoMark />
      <span className="font-logo brand-wordmark" aria-hidden="true">
        <span className="brand-wordmark-magic">{firstWord}</span>{" "}
        <span className="brand-wordmark-rest">{rest.join(" ")}</span>
      </span>
    </span>
  );
}
