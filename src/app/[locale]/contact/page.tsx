import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { isLocale, t } from "@/i18n";
import Booking from "@/components/Booking";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const content = await getContent();
  return {
    title: params.locale === "ar" ? "تواصل · AbsyCode" : "Contact · AbsyCode",
    description: t(content.ui.finalCtaBody, params.locale),
    alternates: { canonical: `/${params.locale}/contact`, languages: { en: "/en/contact", ar: "/ar/contact" } },
  };
}

export default async function ContactPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const content = await getContent();
  return (
    <div className="bg-[#382216] text-[#FAF3EC] min-h-screen">
      <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-16 sm:px-8">
        <p className="eyebrow !text-[#FAF3EC]/50">— {locale === "ar" ? "تواصل" : "Contact"}</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">{t(content.ui.finalCta, locale)}</h1>
        <p className="mt-3 text-[#FAF3EC]/70">{t(content.ui.finalCtaBody, locale)}</p>
        <div className="mt-8"><Booking locale={locale} content={content} /></div>
        <dl className="mt-8 space-y-2 text-sm text-[#FAF3EC]/80">
          <div className="flex gap-2"><dt className="font-mono text-xs text-[#FAF3EC]/50">WhatsApp</dt><dd><a className="underline underline-offset-4" href={content.contact.whatsapp}>{content.contact.phoneDisplay}</a></dd></div>
          <div className="flex gap-2"><dt className="font-mono text-xs text-[#FAF3EC]/50">Email</dt><dd><a className="underline underline-offset-4" href={`mailto:${content.contact.email}`}>{content.contact.email}</a></dd></div>
        </dl>
      </div>
    </div>
  );
}