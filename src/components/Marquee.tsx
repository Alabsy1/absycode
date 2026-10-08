import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";

export default function Marquee({ locale, content }: { locale: Locale; content: SiteConfig }) {
  const names = content.services.map((s) => t(s.title, locale));
  const row = [...names, ...names];
  return (
    <div className="w-full overflow-hidden border-y border-[#D9CFC4] bg-[#ECE3DA]/60 py-3.5" aria-hidden="true">
      <div className="marquee-track whitespace-nowrap font-mono text-sm text-[#7A6A5F]">
        {row.map((n, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            <span>{n}</span>
            <span className="text-[#B5622F]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
