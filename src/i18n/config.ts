export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * The default locale is served without a prefix (`/pricing`, not `/en/pricing`)
 * so the English site keeps clean canonical URLs. Additional locales will be
 * prefixed (`/ja/pricing`) — the rewrite in `proxy.ts` handles both.
 */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === defaultLocale ? clean : `/${locale}${clean}`;
}
