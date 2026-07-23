import Link from "next/link";
import { auth } from "@/lib/auth";
import { findUserById } from "@/lib/users";
import { isSubscribed } from "@/lib/credits";
import { getDictionary, localePath, type Locale } from "@/i18n";
import { SITE } from "@/lib/config";
import { generatorHref } from "@/lib/navigation";
import { ArrowRight, Globe2 } from "lucide-react";
import { AuthButton } from "./AuthButton";
import { CreditBalance } from "./CreditBalance";
import { Logo } from "./Logo";
import { MobileNavMenu, type MobileNavItem } from "./MobileNavMenu";

export async function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const session = await auth();
  const user = session?.user?.id ? await findUserById(session.user.id) : null;
  const home = localePath(locale, "/");
  const mainItems: MobileNavItem[] = [
    { href: generatorHref(home, "text"), label: "Create from text", icon: "text" },
    { href: generatorHref(home, "image"), label: "Convert a photo", icon: "photo" },
    { href: `${home}#color-guidance`, label: "Color guidance", icon: "palette" },
    { href: `${home}#examples`, label: "Examples", icon: "examples" },
    { href: localePath(locale, "/pricing"), label: "Pricing", icon: "pricing" },
    ...(user ? [{ href: localePath(locale, "/my-pages"), label: t.nav.myPages, icon: "pages" as const }] : []),
  ];

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href={home} aria-label={`${SITE.name} home`}><Logo name={SITE.name} /></Link>
        <nav className="main-nav" aria-label="Main navigation">{mainItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
        <div className="header-actions">
          {user ? <CreditBalance initialCredits={user.credits} initialUnlimited={isSubscribed(user)} creditsLabel={t.nav.credits} unlimitedLabel={t.generator.unlimited} href={localePath(locale, "/my-pages?view=credits")} /> : null}
          <span className="locale-label"><Globe2 size={15} />{locale.toUpperCase()}</span>
          <MobileNavMenu label={t.nav.menu} items={mainItems} />
          {user ? <div className="header-account"><AuthButton signedIn labels={{ signIn: t.nav.signIn, signOut: t.nav.signOut }} /></div> : null}
          {!user ? <Link className="header-cta" href={generatorHref(home, "text")}>Start creating <ArrowRight size={15} /></Link> : null}
        </div>
      </div>
    </header>
  );
}
