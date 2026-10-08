import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";

export default function Testimonials({ locale, content }: { locale: Locale; content: SiteConfig }) {
  if (!content.showTestimonials) return null;
  return (
    <section className="w-full py-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        <p className="eyebrow">— Testimonials</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {content.testimonials.map((x, i) => (
            <figure key={i} className="card p-6">
              <blockquote className="text-lg leading-relaxed">“{t(x.quote, locale)}”</blockquote>
              <figcaption className="mt-3 font-mono text-xs text-[#7A6A5F]">{t(x.name, locale)} · {t(x.role, locale)}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
