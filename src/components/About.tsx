import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";

export default function About({ locale, content }: { locale: Locale; content: SiteConfig }) {
  return (
    <section id="about" className="w-full scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        <p className="eyebrow">— {locale === "ar" ? "من نحن" : "About"}</p>
        <div className="mt-4 grid items-start gap-8 md:grid-cols-2">
          <div>
            <blockquote className="font-serif text-2xl italic leading-snug md:text-4xl">
              “{t(content.founder.quote, locale)}”
            </blockquote>
            <p className="mt-4 font-mono text-xs text-[#7A6A5F]">{t(content.founder.role, locale)}</p>
          </div>
          <div className="card p-5 md:p-6">
            <p className="font-mono text-xs text-[#7A6A5F]">— AbsyCode</p>
            <p className="mt-2 text-sm leading-relaxed text-[#7A6A5F]">
              {locale === "ar"
                ? "وكالة صغيرة نبني المواقع وأنظمة الأعمال للشركات التي تريد شيئاً يعمل كل يوم — بلا تعقيد وبلا وسطاء."
                : "A small agency building websites and business systems for companies that want something that works every day — no bloat, no middlemen."}
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {content.stats.map((s) => (
            <div key={t(s.label, locale)} className="card p-5 text-center">
              <p className="font-mono text-3xl font-bold tracking-tight md:text-4xl">{s.value}</p>
              <p className="mt-1 font-mono text-[11px] leading-snug text-[#7A6A5F]">{t(s.label, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
