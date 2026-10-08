import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";

export default function Process({ locale, content }: { locale: Locale; content: SiteConfig }) {
  return (
    <section id="process" className="w-full scroll-mt-20 border-y border-[#D9CFC4] bg-[#ECE3DA]/50">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-24 lg:px-10">
        <p className="eyebrow">— {locale === "ar" ? "منهجية العمل" : "Process"}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">{locale === "ar" ? "واضح من أول مكالمة" : "Clear from the first call"}</h2>

        <ol className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {content.process.map((s, i) => (
            <li
              key={s.n}
              className={`relative bg-transparent ps-6 md:ps-0 ${
                i < content.process.length - 1 ? "border-s border-[#D9CFC4] md:border-s-0" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="absolute -left-[5px] top-1.5 hidden h-2.5 w-2.5 rounded-full bg-[#382216] md:-start-[5px] md:block"
              />
              <div className="rounded-xl border border-[#D9CFC4] bg-[#FAF3EC] p-5">
                <span className="font-mono text-xs text-[#B5622F]">{s.n}</span>
                <h3 className="mt-2 text-lg font-bold">{t(s.title, locale)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#7A6A5F]">{t(s.body, locale)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
