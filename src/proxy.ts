import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * Locale routing with the default locale unprefixed.
 *
 * `/pricing` is *rewritten* to `/en/pricing` so English keeps clean canonical
 * URLs, while `/ja/pricing` passes straight through once Japanese exists.
 * Requests that spell the default locale explicitly are redirected down to the
 * bare path, so a page is never reachable at two URLs.
 */
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const [, first] = pathname.split("/");

  if (first === defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(first)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
