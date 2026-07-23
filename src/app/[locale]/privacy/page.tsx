import type { Metadata } from "next";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${SITE.name} handles your account, uploads and generated coloring pages.`,
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    title: "What we store",
    body: `When you sign in with Google we store your Google account id, email address, display name and avatar URL. We never receive your Google password. If you generate pages without signing in, we store a random device identifier and your IP address so the free allowance can be counted.`,
  },
  {
    title: "Uploads and generated pages",
    body: `Photos you upload are stored so the image model can read them, and generated coloring pages are stored so you can come back to them. Both live in our storage provider. Ask us to delete them and we will remove them from your account.`,
  },
  {
    title: "Third parties",
    body: `Sign-in is handled by Google. Payments are handled by Stripe, which receives your email address and card details directly — we never see the card. Image generation is performed by an external model provider, which receives your prompt and any uploaded photo.`,
  },
  {
    title: "Cookies",
    body: `We set a session cookie when you sign in, and a device cookie that counts free generations. We do not use advertising cookies.`,
  },
  {
    title: "Contact",
    body: `To request deletion of your account or your images, email us and we will action it.`,
  },
];

export default function PrivacyPage() {
  return (
    <section className="legal-page mx-auto max-w-3xl px-5 py-10">
      <h1 className="mb-6 text-center text-[32px] font-semibold tracking-tight">Privacy</h1>
      <div className="grid gap-3">
        {SECTIONS.map((section) => (
          <article key={section.title} className="card px-7 py-7 text-center">
            <h2 className="mb-2 text-[16px] font-semibold tracking-tight">{section.title}</h2>
            <p className="text-[14.5px] leading-relaxed text-muted">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
