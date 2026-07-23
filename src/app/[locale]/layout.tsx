import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Roboto_Slab } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { isLocale, locales, type Locale } from "@/i18n";
import { SITE } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../globals.css";

const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-roboto-slab", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.tagline} — Photo to Coloring Page | ${SITE.name}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Free AI coloring page generator. Turn a photo or a text description into clean, printable black-and-white line art in seconds. Two free pages, no watermark.",
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.tagline} — Photo to Coloring Page`,
    description:
      "Turn any photo or idea into a clean, printable coloring page in seconds. Two free pages, no account needed.",
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.tagline} — ${SITE.name}`,
    description: "Turn any photo or idea into a printable black-and-white coloring page in seconds.",
  },
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={robotoSlab.variable} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <SessionProvider>
          <Header locale={locale as Locale} />
          <main>{children}</main>
          <Footer locale={locale as Locale} />
        </SessionProvider>
      </body>
    </html>
  );
}
