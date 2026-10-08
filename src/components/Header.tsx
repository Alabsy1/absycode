"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SiteConfig } from "@/config/site";
import { t, otherLocale, type Locale } from "@/i18n";
import Logo from "./Logo";
import DashboardLink from "./DashboardLink";
import ErrorBoundary from "./ErrorBoundary";

function navHref(locale: Locale, href: string) {
  if (href.startsWith("#")) return href === "#contact" ? `/${locale}/contact` : `/${locale}${href}`;
  return href;
}

export default function Header({ locale, content }: { locale: Locale; content: SiteConfig }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const alt = otherLocale(locale);

  function switchLocale() {
    document.cookie = `absy-locale=${alt}; path=/; max-age=31536000`;
    const path = window.location.pathname.replace(/^\/(en|ar)/, "");
    window.location.href = `/${alt}${path || ""}`;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all ${
        scrolled ? "backdrop-blur-md bg-[#FAF3EC]/85 border-[#D9CFC4]" : "bg-[#FAF3EC]/0 border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-[#382216]" aria-label="AbsyCode home">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight">AbsyCode</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {content.nav.map((n) => (
            <Link
              key={n.key}
              href={navHref(locale, n.href)}
              className="text-sm text-[#7A6A5F] no-underline transition-colors hover:text-[#B5622F]"
            >
              {t(n.label, locale)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DashboardLink locale={locale} />
          <Link
            href="/login"
            className="hidden text-sm text-[#7A6A5F] no-underline transition-colors hover:text-[#B5622F] sm:inline-flex"
          >
            {t(content.ui.login, locale)}
          </Link>
          <button onClick={switchLocale} className="chip" aria-label="Switch language">
            {locale === "en" ? "العربية" : "EN"}
          </button>
          <Link href={`/${locale}/contact`} className="btn-primary hidden !px-4 !py-2 text-sm sm:inline-flex">
            {t(content.ui.startProject, locale)}
          </Link>
          <button
            className="-m-1 p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 22 22" stroke="currentColor" strokeWidth="2" fill="none" className="h-6 w-6 shrink-0" aria-hidden="true">
              <path d="M3 6h16M3 11h16M3 16h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-[#D9CFC4] bg-[#FAF3EC]/95 px-5 py-3 backdrop-blur-md md:hidden"
          aria-label="Mobile"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col">
            {content.nav.map((n) => (
              <Link
                key={n.key}
                onClick={() => setOpen(false)}
                href={navHref(locale, n.href)}
                className="border-b border-[#D9CFC4]/60 py-3 text-[#382216] no-underline last:border-0 hover:text-[#B5622F]"
              >
                {t(n.label, locale)}
              </Link>
            ))}
            <Link onClick={() => setOpen(false)} href="/login" className="border-b border-[#D9CFC4]/60 py-3 text-[#382216] no-underline hover:text-[#B5622F] sm:hidden">
              {t(content.ui.login, locale)}
            </Link>
            <Link onClick={() => setOpen(false)} href={`/${locale}/contact`} className="btn-primary mt-3 justify-center">
              {t(content.ui.startProject, locale)}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
