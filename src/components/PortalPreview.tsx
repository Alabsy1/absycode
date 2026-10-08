"use client";
import type { Locale } from "@/i18n";
import ErrorBoundary from "./ErrorBoundary";

const milestones = [
  { en: "Design approved", ar: "التصميم معتمد", done: true, pct: 100 },
  { en: "Build in progress", ar: "التنفيذ جارٍ", done: false, pct: 65 },
  { en: "Launch & support", ar: "الإطلاق والدعم", done: false, pct: 0 },
];
const invoices = [
  { id: "INV-014", en: "Deposit", ar: "دفعة أولى", state: "Paid", paidAr: "مدفوعة", amount: "$600" },
  { id: "INV-015", en: "Milestone 2", ar: "المرحلة الثانية", state: "Pending", paidAr: "معلقة", amount: "$600" },
];
const messages = [
  { en: "Homepage preview is ready — take a look.", ar: "معاينة الصفحة الرئيسية جاهزة — ألق نظرة.", me: false },
  { en: "Looks great, one small change on the hero.", ar: "ممتاز، تعديل صغير في الهيرو.", me: true },
  { en: "Done. Launch checklist starts tomorrow.", ar: "تم. قائمة الإطلاق تبدأ غداً.", me: false },
];

export default function PortalPreview({ locale }: { locale: Locale }) {
  const isRtl = locale === "ar";
  const nav = isRtl
    ? ["نظرة عامة", "المراحل", "الفواتير", "الرسائل"]
    : ["Overview", "Milestones", "Invoices", "Messages"];

  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        <p className="eyebrow">— {isRtl ? "بوابة العميل" : "Client portal"}</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
          {isRtl ? "لمحة عن بوابة عميلك" : "A peek at your client portal"}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#7A6A5F]">
          {isRtl ? "هكذا يبدو العمل معنا: تقدم واضح وفواتير ورسائل في مكان واحد." : "This is what working with us looks like: clear progress, invoices and messages in one place."}
        </p>

        <ErrorBoundary
          name="portal-preview"
          fallback={
            <div className="mt-8 overflow-hidden rounded-xl border border-[#D9CFC4] bg-[#FAF3EC] shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#D9CFC4] bg-[#ECE3DA] px-4 py-2.5">
                <span className="min-w-0 truncate font-mono text-[11px] text-[#7A6A5F] ps-2">portal.absycode.com</span>
              </div>
            </div>
          }
        >
        <div className="mt-8 overflow-hidden rounded-xl border border-[#D9CFC4] bg-[#FAF3EC] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#D9CFC4] bg-[#ECE3DA] px-4 py-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D9CFC4]" aria-hidden="true" />
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D9CFC4]" aria-hidden="true" />
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D9CFC4]" aria-hidden="true" />
            <span className="min-w-0 truncate font-mono text-[11px] text-[#7A6A5F] ps-2">portal.absycode.com</span>
          </div>

          <div className="md:grid md:grid-cols-[210px_1fr]">
            <aside className="border-b border-[#D9CFC4] p-4 md:border-b-0 md:border-e" aria-hidden="true">
              <p className="font-mono text-[11px] uppercase text-[#7A6A5F]">{isRtl ? "المشروع" : "Project"}</p>
              <p className="mt-0.5 text-sm font-bold">{isRtl ? "موقع شركتك" : "Your company site"}</p>
              <ul className="mt-4 flex flex-wrap gap-2 md:flex-col md:gap-1">
                {nav.map((n, i) => (
                  <li
                    key={n}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      i === 0 ? "bg-[#382216] text-[#FAF3EC] md:font-semibold" : "text-[#7A6A5F]"
                    }`}
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </aside>

            <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6">
              <div className="rounded-xl border border-[#D9CFC4] bg-[#ECE3DA]/50 p-4">
                <p className="font-mono text-xs text-[#7A6A5F]">{isRtl ? "تقدم المشروع" : "Project progress"}</p>
                <p className="mt-1 text-3xl font-bold">65%</p>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-[#D9CFC4] bg-[#FAF3EC]">
                  <div className="h-full w-[65%] bg-[#382216]" />
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {milestones.map((m) => (
                    <li key={m.en} className="flex items-center justify-between gap-3">
                      <span className={m.done ? "text-[#7A6A5F] line-through" : ""}>{isRtl ? m.ar : m.en}</span>
                      <span className="font-mono text-xs text-[#B5622F]">{m.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#D9CFC4] bg-[#ECE3DA]/50 p-4">
                <p className="font-mono text-xs text-[#7A6A5F]">{isRtl ? "الفواتير" : "Invoices"}</p>
                <ul className="mt-3 space-y-2">
                  {invoices.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#D9CFC4] bg-[#FAF3EC] px-3 py-2.5 text-sm">
                      <span className="min-w-0 truncate"><span className="font-mono text-xs text-[#7A6A5F]">{i.id}</span> · {isRtl ? i.ar : i.en}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] ${i.state === "Paid" ? "bg-[#382216] text-[#FAF3EC]" : "border border-[#B5622F] text-[#B5622F]"}`}>
                        {isRtl ? i.paidAr : i.state}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-mono text-xs text-[#7A6A5F]">Total · $1,200</p>
              </div>

              <div className="rounded-xl border border-[#D9CFC4] bg-[#ECE3DA]/50 p-4 md:col-span-2">
                <p className="font-mono text-xs text-[#7A6A5F]">{isRtl ? "الرسائل" : "Messages"}</p>
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {messages.map((m, i) => (
                    <li key={i} className={`max-w-[85%] rounded-xl px-3 py-2 leading-snug ${m.me ? "self-end bg-[#382216] text-[#FAF3EC]" : "self-start border border-[#D9CFC4] bg-[#FAF3EC]"}`}>
                      {isRtl ? m.ar : m.en}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        </ErrorBoundary>
      </div>
    </section>
  );
}

/** Static heading-only rendering used when the mock window cannot render. */
export function PortalPreviewFallback({ locale }: { locale: Locale }) {
  const isRtl = locale === "ar";
  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        <p className="eyebrow">— {isRtl ? "بوابة العميل" : "Client portal"}</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
          {isRtl ? "لمحة عن بوابة عميلك" : "A peek at your client portal"}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#7A6A5F]">
          {isRtl ? "هكذا يبدو العمل معنا: تقدم واضح وفواتير ورسائل في مكان واحد." : "This is what working with us looks like: clear progress, invoices and messages in one place."}
        </p>
      </div>
    </section>
  );
}
