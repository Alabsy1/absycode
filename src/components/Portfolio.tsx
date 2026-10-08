"use client";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";

export default function Portfolio({ locale, content }: { locale: Locale; content: SiteConfig }) {
  const [cat, setCat] = useState("all");
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === "ar";

  const items = useMemo(() => content.projects.filter((p) => cat === "all" || p.category === cat), [cat, content.projects]);
  const previewProject = content.projects.find((p) => p.slug === preview);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const scrolled = Math.abs(el.scrollLeft);
    setProgress(max > 4 ? Math.min(1, scrolled / max) : 1);
  }

  function scrollBy(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(360, el.clientWidth * 0.8);
    el.scrollBy({ left: isRtl ? -dir * amount : dir * amount, behavior: "smooth" });
  }

  const Arrow = ({ rtlGlyph, ltrGlyph, label, onClick }: { rtlGlyph: string; ltrGlyph: string; label: string; onClick: () => void }) => (
    <button onClick={onClick} aria-label={label} className="chip !px-3.5 !py-2">
      <span aria-hidden="true">{isRtl ? rtlGlyph : ltrGlyph}</span>
    </button>
  );

  return (
    <section id="work" className="w-full scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        <p className="eyebrow">— {locale === "ar" ? "أعمالنا" : "Portfolio"}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight md:text-5xl">
            {locale === "ar" ? "أعمال لشركات حقيقية" : "Work made for real businesses"}
          </h2>
          <div className="flex gap-2">
            <Arrow rtlGlyph="→" ltrGlyph="←" label={locale === "ar" ? "السابق" : "Previous"} onClick={() => scrollBy(-1)} />
            <Arrow rtlGlyph="←" ltrGlyph="→" label={locale === "ar" ? "التالي" : "Next"} onClick={() => scrollBy(1)} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 pb-1" role="group" aria-label="Filter">
          {content.categories.map((c) => (
            <button key={c.key} className="chip" aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>
              {t(c.label, locale)}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:px-8 lg:px-10"
        role="region"
        aria-label="Projects carousel"
        tabIndex={0}
      >
        {items.map((p) => (
          <article key={p.slug} className="card group w-[85%] shrink-0 snap-start overflow-hidden sm:w-[48%] lg:w-[32%]">
            <div className="flex items-center gap-1.5 border-b border-[#D9CFC4] bg-[#FAF3EC] px-3 py-2" aria-hidden="true">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D9CFC4]" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D9CFC4]" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D9CFC4]" />
              <span className="min-w-0 truncate font-mono text-[11px] text-[#7A6A5F] ps-2">{p.displayUrl}</span>
            </div>
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#ECE3DA]">
              <Image
                src={p.image ?? `/projects/${p.slug}.svg`}
                alt={`${p.name} preview`}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 48vw, 32vw"
                className="object-cover"
              />
              <button
                onClick={() => setPreview(p.slug)}
                className="absolute inset-0 hidden items-center justify-center bg-[#382216]/0 opacity-0 transition-all hover:bg-[#382216]/35 hover:opacity-100 focus-visible:bg-[#382216]/35 focus-visible:opacity-100 md:flex"
                aria-label={`Live preview ${p.name}`}
              >
                <span className="rounded-full bg-[#FAF3EC] px-4 py-2 text-sm font-semibold text-[#382216] shadow">
                  {locale === "ar" ? "معاينة مباشرة" : "Live preview"}
                </span>
              </button>
            </div>
            <div className="flex flex-col gap-1.5 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#B5622F]">{t(p.categoryLabel, locale)}</p>
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-[#7A6A5F]">{t(p.description, locale)}</p>
              <div className="mt-2">
                <Link href={`/${locale}/work/${p.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#382216] transition-colors hover:text-[#B5622F]">
                  {locale === "ar" ? "دراسة الحالة" : "Case study"}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-4 w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#ECE3DA]" aria-hidden="true">
          <div className="h-full rounded-full bg-[#382216] transition-[width] duration-200" style={{ width: `${Math.max(8, progress * 100)}%` }} />
        </div>
      </div>

      {previewProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${previewProject.name} preview`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#382216]/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-xl border border-[#D9CFC4] bg-[#FAF3EC]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#D9CFC4] px-4 py-2.5">
              <span className="truncate font-mono text-xs text-[#7A6A5F]">{previewProject.displayUrl}</span>
              <div className="flex shrink-0 gap-2">
                <a href={previewProject.url} target="_blank" rel="noreferrer" className="chip">
                  {locale === "ar" ? "فتح في تبويب جديد" : "Open in new tab"} ↗
                </a>
                <button onClick={() => setPreview(null)} className="chip !px-3" aria-label="Close">✕</button>
              </div>
            </div>
            <iframe
              src={previewProject.url}
              title={previewProject.name}
              className="h-[60vh] w-full bg-white"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      )}
    </section>
  );
}
