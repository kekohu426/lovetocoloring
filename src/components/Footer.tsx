import Link from "next/link";
import { localePath, type Locale } from "@/i18n";
import { SITE } from "@/lib/config";
import { Logo } from "./Logo";

export function Footer({ locale }: { locale: Locale }) {
  const home = localePath(locale, "/");
  const textTool = localePath(locale, "/text-to-coloring-page");
  const photoTool = localePath(locale, "/photo-to-coloring-page");

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-intro">
          <div>
            <Link className="brand footer-brand" href={home}><Logo name={SITE.name} /></Link>
            <p>Turn an idea or favorite photo into printable line art, a coordinated palette and a practical four-step coloring guide.</p>
          </div>
          <Link className="footer-create-link" href={textTool}>Create a coloring page <span aria-hidden="true">→</span></Link>
        </div>

        <nav className="footer-grid" aria-label="Footer navigation">
          <div><h2>Create</h2><Link href={textTool}>Text to coloring page</Link><Link href={photoTool}>Photo to coloring page</Link><Link href={`${home}#color-guidance`}>Color guidance</Link><Link href={localePath(locale, "/my-pages")}>My coloring pages</Link></div>
          <div><h2>Popular ideas</h2><Link href={`${textTool}?preset=kids`}>Kids coloring pages</Link><Link href={`${textTool}?preset=classroom`}>Classroom worksheets</Link><Link href={`${textTool}?preset=adult`}>Adult coloring pages</Link><Link href={`${textTool}?preset=birthday`}>Birthday coloring pages</Link></div>
          <div><h2>From photos</h2><Link href={`${photoTool}?preset=pet`}>Pet coloring pages</Link><Link href={`${photoTool}?preset=family`}>Family photo coloring pages</Link><Link href={photoTool}>Photo to printable line art</Link><Link href={photoTool}>Photo quality guide</Link></div>
          <div><h2>Coloring outputs</h2><Link href={`${home}#color-guidance`}>Palette directions</Link><Link href={`${home}#color-guidance`}>Four-step color guide</Link><Link href={localePath(locale, "/my-pages")}>Printable PNG &amp; PDF</Link><Link href={localePath(locale, "/my-pages")}>Download and print</Link></div>
          <div><h2>Site</h2><Link href={localePath(locale, "/pricing")}>Pricing</Link><Link href={localePath(locale, "/my-pages")}>My pages</Link><Link href={localePath(locale, "/privacy")}>Privacy</Link><Link href={localePath(locale, "/terms")}>Terms</Link></div>
        </nav>

        <div className="footer-bottom"><span>© {new Date().getFullYear()} {SITE.name}</span><span>Printable coloring pages, thoughtful palettes and guides for every colorist.</span></div>
      </div>
    </footer>
  );
}
