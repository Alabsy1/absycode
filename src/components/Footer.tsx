import Link from "next/link";
import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";
import Logo from "./Logo";
import DashboardLink from "./DashboardLink";

function contactHref(key: string, c: SiteConfig["contact"]): string | null {
  if (key === "instagram") return c.instagram;
  if (key === "facebook") return c.facebookUrl || null;
  if (key === "maps") return c.mapsUrl || null;
  return null;
}

function navHref(locale: Locale, href: string) {
  if (href.startsWith("#")) return href === "#contact" ? `/${locale}/contact` : `/${locale}${href}`;
  return href;
}

export default function Footer({ locale, content }: { locale: Locale; content: SiteConfig }) {
  const linkCls = "text-sm text-[#FAF3EC]/70 no-underline transition-colors hover:text-[#B5622F]";
  return (
    <footer className="w-full bg-[#382216] text-[#FAF3EC]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-bold">AbsyCode</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-[#FAF3EC]/70">{t(content.ui.footerTag, locale)}</p>
          <p className="eyebrow mt-4 !text-[#FAF3EC]/50">AbsyCode — {t(content.location, locale)}</p>
        </div>

        <nav aria-label="Navigate">
          <p className="eyebrow mb-3 !text-[#FAF3EC]/50">— Navigate</p>
          <ul className="flex flex-col gap-2">
            {content.nav.map((n) => (
              <li key={n.key}>
                <Link className={linkCls} href={navHref(locale, n.href)}>{t(n.label, locale)}</Link>
              </li>
            ))}
            <li>
              <Link className={linkCls} href={`/${locale}/insights`}>
                {locale === "ar" ? "المدونة" : "Insights"}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-3 !text-[#FAF3EC]/50">— Social</p>
          <ul className="flex flex-col gap-2">
            {content.socials.map((s) => {
              const href = contactHref(s.key, content.contact);
              if (!href) return null;
              return (
                <li key={s.key}>
                  <a className={linkCls} href={href} target="_blank" rel="noreferrer">{t(s.label, locale)}</a>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3 !text-[#FAF3EC]/50">— Contact</p>
          <ul className="flex flex-col gap-2 text-sm text-[#FAF3EC]/70">
            <li><a className={linkCls} href={content.contact.whatsapp} target="_blank" rel="noreferrer">{content.contact.phoneDisplay}</a></li>
            <li><a className={linkCls} href={`mailto:${content.contact.email}`}>{content.contact.email}</a></li>
            <li>{t(content.location, locale)}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-4 text-xs text-[#FAF3EC]/60 sm:px-8 lg:px-10">
          <span>© {new Date().getFullYear()} AbsyCode</span>
          <div className="flex items-center gap-4">
            <DashboardLink locale={locale} />
            <Link href={locale === "en" ? "/ar" : "/en"} className="text-[#FAF3EC]/60 no-underline hover:text-[#B5622F]">
              {locale === "en" ? "العربية" : "English"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
