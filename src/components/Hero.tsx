"use client";
import Link from "next/link";
import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";
import Reveal from "./Reveal";
import Wireframe from "./Wireframe";

export default function Hero({ locale, content }: { locale: Locale; content: SiteConfig }) {
  return (
    <section className="relative w-full overflow-hidden">
      <Wireframe
        variant="sphere"
        className="pointer-events-none absolute -top-16 -end-32 h-[300px] w-[300px] opacity-50 sm:-end-16 sm:h-[420px] sm:w-[420px] sm:opacity-70 lg:end-[-6%] lg:top-[-8%] lg:h-[560px] lg:w-[560px]"
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24 lg:px-10">
        <Reveal as="p" className="eyebrow">
          — AbsyCode — {t(content.location, locale)}
        </Reveal>
        <Reveal
          as="h1"
          delay={80}
          className="mt-4 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
        >
          {t(content.tagline, locale)}
        </Reveal>
        <Reveal
          as="p"
          delay={160}
          className="mt-5 max-w-xl text-base leading-relaxed text-[#7A6A5F] md:text-lg"
        >
          {t(content.heroSupport, locale)}
        </Reveal>
        <Reveal delay={240} className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${locale}/#work`} className="btn-primary">
            {t(content.ui.viewWork, locale)}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href={`/${locale}/#contact`} className="btn-secondary">
            {t(content.ui.discuss, locale)}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
