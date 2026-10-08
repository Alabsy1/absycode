import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";
import Booking from "./Booking";
import Wireframe from "./Wireframe";

export default function FinalCta({ locale, content }: { locale: Locale; content: SiteConfig }) {
  return (
    <section className="relative w-full overflow-hidden bg-[#382216] text-[#FAF3EC]">
      <Wireframe
        variant="cube"
        className="pointer-events-none absolute -bottom-28 -end-24 hidden h-[340px] w-[340px] opacity-40 md:block lg:h-[420px] lg:w-[420px]"
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-24 lg:px-10">
        <p className="eyebrow !text-[#FAF3EC]/50">— {locale === "ar" ? "تواصل" : "Contact"}</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">{t(content.ui.finalCta, locale)}</h2>
        <p className="mt-3 max-w-xl leading-relaxed text-[#FAF3EC]/70">{t(content.ui.finalCtaBody, locale)}</p>
        <div className="mt-8 max-w-3xl">
          <Booking locale={locale} content={content} />
        </div>
      </div>
    </section>
  );
}
