import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";

const svgProps = { width: 40, height: 40, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, className: "h-10 w-10 shrink-0 text-[#382216]" } as const;

const ICONS: Record<string, JSX.Element> = {
  globe: <svg {...svgProps} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" /></svg>,
  layers: <svg {...svgProps} aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" /></svg>,
  bag: <svg {...svgProps} aria-hidden="true"><path d="M6 8h15l-1.5 12h-12L6 8zM9 8V6a3 3 0 016 0v2" /></svg>,
  spark: <svg {...svgProps} aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" /></svg>,
  grid: <svg {...svgProps} aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>,
  chart: <svg {...svgProps} aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-8M21 20H3" /></svg>,
};

export default function Services({ locale, content }: { locale: Locale; content: SiteConfig }) {
  return (
    <section id="services" className="w-full scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        <p className="eyebrow">— {locale === "ar" ? "خدماتنا" : "Services"}</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
          {locale === "ar" ? "كل ما يحتاجه عملك، في مكان واحد" : "Everything your business needs, in one place"}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {content.services.map((s, i) => (
            <article key={s.key} className="card flex flex-col gap-3 p-5 transition-colors hover:border-[#382216]/40">
              <div className="flex items-start justify-between gap-3">
                {ICONS[s.icon]}
                <span className="font-mono text-xs text-[#7A6A5F]">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="text-lg font-bold">{t(s.title, locale)}</h3>
              <p className="flex-1 text-sm leading-relaxed text-[#7A6A5F]">{t(s.body, locale)}</p>
              <div className="flex flex-wrap gap-1.5">
                {t(s.tags, locale).split("·").map((tag) => (
                  <span key={tag.trim()} className="rounded-full border border-[#D9CFC4] bg-[#FAF3EC] px-2.5 py-1 font-mono text-[11px] text-[#B5622F]">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
