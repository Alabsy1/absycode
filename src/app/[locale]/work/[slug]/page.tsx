import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { getContent } from "@/lib/content";
import { isLocale, t } from "@/i18n";
import JsonLd from "@/components/JsonLd";

export function generateStaticParams() {
  return site.projects.flatMap((p) => [{ locale: "en", slug: p.slug }, { locale: "ar", slug: p.slug }]);
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const content = await getContent();
  const p = content.projects.find((x) => x.slug === params.slug);
  if (!p) return {};
  return {
    title: `${p.name} · AbsyCode`,
    description: t(p.description, params.locale),
    alternates: { canonical: `/${params.locale}/work/${p.slug}`, languages: { en: `/en/work/${p.slug}`, ar: `/ar/work/${p.slug}` } },
    openGraph: { title: `${p.name} · AbsyCode`, description: t(p.description, params.locale), images: [p.image ?? `/projects/${p.slug}.svg`], type: "article" },
  };
}

export default async function CaseStudy({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const content = await getContent();
  const p = content.projects.find((x) => x.slug === params.slug);
  if (!p) notFound();
  const rows: [string, string][] = [
    [locale === "ar" ? "المشكلة" : "Problem", t(p.problem, locale)],
    [locale === "ar" ? "الحل" : "Solution", t(p.solution, locale)],
    [locale === "ar" ? "النتيجة" : "Result", t(p.result, locale)],
  ];
  return (
    <>
      <JsonLd
        locale={locale}
        page="project"
        project={{ name: p.name, url: p.url, description: t(p.description, locale) }}
        contact={{ email: content.contact.email, instagram: content.contact.instagram, phoneIntl: content.contact.phoneIntl }}
      />
      <article className="mx-auto w-full max-w-3xl px-5 pt-12 pb-16 sm:px-8">
        <p className="eyebrow">— {t(p.categoryLabel, locale)}</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">{p.name}</h1>
        <p className="mt-3 text-[#7A6A5F]">{t(p.description, locale)}</p>
        <Image src={p.image ?? `/projects/${p.slug}.svg`} alt={`${p.name} cover`} width={960} height={540} className="mt-6 w-full rounded-xl border border-[#D9CFC4]" />
        <div className="mt-8 space-y-6">
          {rows.map(([k, v]) => (
            <section key={k} className="card p-5">
              <h2 className="font-mono text-xs uppercase tracking-wide text-[#B5622F]">{k}</h2>
              <p className="mt-2 leading-relaxed">{v}</p>
            </section>
          ))}
          <section className="card p-5">
            <h2 className="font-mono text-xs uppercase tracking-wide text-[#B5622F]">{locale === "ar" ? "التقنيات" : "Stack"}</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {p.stack.map((s) => (<li key={s} className="chip">{s}</li>))}
            </ul>
          </section>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={p.url} target="_blank" rel="noreferrer" className="btn-primary">{locale === "ar" ? "زيارة الموقع" : "Visit site"} ↗</a>
          <Link href={`/${locale}/#work`} className="btn-secondary">← {locale === "ar" ? "كل الأعمال" : "All work"}</Link>
        </div>
      </article>
    </>
  );
}