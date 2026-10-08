"use client";
import { useMemo, useState } from "react";
import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";

function OptionCard({ selected, onClick, title, sub }: { selected: boolean; onClick: () => void; title: string; sub?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-xl border p-4 text-start transition-colors ${selected ? "border-[#382216] bg-[#ECE3DA] shadow-sm" : "border-[#D9CFC4] bg-[#FAF3EC] hover:border-[#382216]/50"}`}
    >
      <span className="block text-sm font-bold">{title}</span>
      {sub && <span className="mt-1 block font-mono text-xs text-[#7A6A5F]">{sub}</span>}
    </button>
  );
}

export default function Estimator({ locale, content }: { locale: Locale; content: SiteConfig }) {
  const [step, setStep] = useState(0);
  const [typeKey, setTypeKey] = useState(content.estimator.baseByType[0]?.key ?? "");
  const [feats, setFeats] = useState<string[]>([]);
  const [timeKey, setTimeKey] = useState("standard");
  const [name, setName] = useState("");
  const [need, setNeed] = useState("");
  const isRtl = locale === "ar";

  const base = content.estimator.baseByType.find((b) => b.key === typeKey) ?? content.estimator.baseByType[0];
  const time = content.estimator.timeline.find((x) => x.key === timeKey) ?? content.estimator.timeline[0];

  const { min, max, wMin, wMax } = useMemo(() => {
    if (!base || !time) return { min: 0, max: 0, wMin: 0, wMax: 0 };
    const sel = content.estimator.features.filter((f) => feats.includes(f.key));
    const aMin = sel.reduce((s, f) => s + f.addMin, 0);
    const aMax = sel.reduce((s, f) => s + f.addMax, 0);
    return {
      min: Math.round((base.priceMin + aMin) * time.mult),
      max: Math.round((base.priceMax + aMax) * time.mult),
      wMin: Math.max(1, base.weeksMin + time.weeksDelta),
      wMax: Math.max(2, base.weeksMax + time.weeksDelta),
    };
  }, [base, feats, time, content.estimator.features]);

  // Never render a broken calculator: an empty/invalid estimator config from
  // the DB degrades to the heading instead of crashing the page.
  if (!base || !time) return <EstimatorFallback locale={locale} />;

  const summary = `Hi AbsyCode! I'm ${name || "interested in a project"}. ${need ? `Project: ${need}. ` : ""}Type: ${t(base.label, locale)}. Features: ${feats.length ? feats.map((k) => t(content.estimator.features.find((f) => f.key === k)!.label, locale)).join(", ") : "none"}. Timeline: ${t(time.label, locale)}. Estimate shown: $${min}–$${max}, ${wMin}–${wMax} weeks.`;
  const waHref = `${content.contact.whatsapp}?text=${encodeURIComponent(summary)}`;

  const stepLabels = isRtl ? ["النوع", "المزايا", "المدة", "تواصل"] : ["Type", "Features", "Timeline", "Contact"];

  return (
    <section id="estimator" className="w-full scroll-mt-20 border-y border-[#D9CFC4] bg-[#ECE3DA]/50">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-24 lg:px-10">
        <p className="eyebrow">— {isRtl ? "حاسبة التكلفة" : "Estimator"}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">{isRtl ? "كم سيكلف مشروعك؟" : "What will your project cost?"}</h2>
        <p className="mt-3 max-w-xl text-sm text-[#7A6A5F]">
          {isRtl ? "أرقام استرشادية — السعر النهائي بعد مكالمة قصيرة." : "Indicative ranges — final quote after a short call."}
        </p>

        <ol className="mt-6 flex flex-wrap gap-2 font-mono text-xs" aria-label="Estimator steps">
          {stepLabels.map((s, i) => (
            <li
              key={s}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 ${
                i === step ? "border-[#382216] bg-[#382216] text-[#FAF3EC]" : i < step ? "border-[#382216] text-[#382216]" : "border-[#D9CFC4] text-[#7A6A5F]"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          <div className="card bg-[#FAF3EC] p-5 md:p-7">
            <div aria-live="polite">
              {step === 0 && (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {content.estimator.baseByType.map((b) => (
                    <OptionCard key={b.key} selected={typeKey === b.key} onClick={() => setTypeKey(b.key)} title={t(b.label, locale)} sub={`$${b.priceMin}–$${b.priceMax} · ${b.weeksMin}–${b.weeksMax}w`} />
                  ))}
                </div>
              )}
              {step === 1 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {content.estimator.features.map((f) => (
                    <OptionCard
                      key={f.key}
                      selected={feats.includes(f.key)}
                      onClick={() => setFeats(feats.includes(f.key) ? feats.filter((x) => x !== f.key) : [...feats, f.key])}
                      title={t(f.label, locale)}
                      sub={`+$${f.addMin}–$${f.addMax}`}
                    />
                  ))}
                </div>
              )}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {content.estimator.timeline.map((x) => (
                    <OptionCard key={x.key} selected={timeKey === x.key} onClick={() => setTimeKey(x.key)} title={t(x.label, locale)} sub={x.mult === 1 ? "standard" : x.mult > 1 ? "+25%" : "−10%"} />
                  ))}
                </div>
              )}
              {step === 3 && (
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="est-name" className="font-mono text-xs text-[#7A6A5F]">{isRtl ? "الاسم" : "Your name"}</label>
                    <input id="est-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={isRtl ? "مثال: أحمد" : "e.g. Ahmed"} className="field mt-1.5" />
                  </div>
                  <div>
                    <label htmlFor="est-need" className="font-mono text-xs text-[#7A6A5F]">{isRtl ? "نبذة عن المشروع" : "Project in one line"}</label>
                    <textarea id="est-need" rows={3} value={need} onChange={(e) => setNeed(e.target.value)} placeholder={isRtl ? "موقع، متجر، نظام…" : "Website, store, system…"} className="field mt-1.5 resize-none" />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a href={waHref} target="_blank" rel="noreferrer" className="btn-primary flex-1">{isRtl ? "إرسال عبر واتساب" : "Send via WhatsApp"} ↗</a>
                    <a href={`mailto:${content.contact.email}?subject=${encodeURIComponent("Project estimate")}&body=${encodeURIComponent(summary)}`} className="btn-secondary flex-1">
                      {isRtl ? "إرسال عبر الإيميل" : "Send via email"}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#D9CFC4] pt-5">
              <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="chip disabled:cursor-not-allowed disabled:opacity-40">
                <span className="me-1">{isRtl ? "→" : "←"}</span> {isRtl ? "رجوع" : "Back"}
              </button>
              {step < 3 ? (
                <button type="button" onClick={() => setStep(step + 1)} className="btn-primary !py-2.5">
                  {isRtl ? "التالي" : "Next"} <span className={isRtl ? "rotate-180" : ""}><span aria-hidden="true">→</span></span>
                </button>
              ) : (
                <button type="button" onClick={() => setStep(0)} className="chip">{isRtl ? "البدء من جديد" : "Restart"}</button>
              )}
            </div>
          </div>

          <aside className="self-start rounded-xl border border-[#D9CFC4] bg-[#ECE3DA] p-5 lg:sticky lg:top-24" aria-label={isRtl ? "التقدير الحالي" : "Current estimate"}>
            <p className="font-mono text-xs text-[#7A6A5F]">{isRtl ? "التقدير الحالي" : "Current estimate"}</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-tight">${min} – ${max}</p>
            <p className="mt-1 font-mono text-xs text-[#7A6A5F]">{wMin}–{wMax} {isRtl ? "أسابيع" : "weeks"}</p>
            <dl className="mt-4 space-y-2 border-t border-[#D9CFC4] pt-4 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-[#7A6A5F]">{isRtl ? "النوع" : "Type"}</dt><dd className="text-end font-medium">{t(base.label, locale)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#7A6A5F]">{isRtl ? "المزايا" : "Features"}</dt><dd className="text-end font-medium">{feats.length}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#7A6A5F]">{isRtl ? "المدة" : "Timeline"}</dt><dd className="text-end font-medium">{t(time.label, locale)}</dd></div>
            </dl>
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-[#7A6A5F]">{isRtl ? "أرقام استرشادية للتقدير فقط." : "Placeholder figures — indicative only."}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/** Static heading-only rendering used when the calculator cannot run. */
export function EstimatorFallback({ locale }: { locale: Locale }) {
  const isRtl = locale === "ar";
  return (
    <section id="estimator" className="w-full scroll-mt-20 border-y border-[#D9CFC4] bg-[#ECE3DA]/50">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-24 lg:px-10">
        <p className="eyebrow">— {isRtl ? "حاسبة التكلفة" : "Estimator"}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">{isRtl ? "كم سيكلف مشروعك؟" : "What will your project cost?"}</h2>
        <p className="mt-3 max-w-xl text-sm text-[#7A6A5F]">
          {isRtl ? "أرقام استرشادية — السعر النهائي بعد مكالمة قصيرة." : "Indicative ranges — final quote after a short call."}
        </p>
      </div>
    </section>
  );
}
