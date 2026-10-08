"use client";
import { useState } from "react";
import type { SiteConfig } from "@/config/site";
import { t, type Locale } from "@/i18n";

export default function Booking({ locale, content }: { locale: Locale; content: SiteConfig }) {
  const isRtl = locale === "ar";
  const [name, setName] = useState("");
  const [need, setNeed] = useState("");
  const body = `Hi AbsyCode! I'm ${name || "(name)"}. I need: ${need || "(describe your project)"}`;
  const msg = encodeURIComponent(body);

  return (
    <div id="contact" className="scroll-mt-24">
      <div className="grid gap-3 sm:grid-cols-3">
        <a href={`${content.contact.whatsapp}?text=${msg}`} target="_blank" rel="noreferrer" className="btn-primary !border-[#25D366] !bg-[#25D366] hover:!bg-[#1eb855] hover:!border-[#1eb855]">
          {t(content.ui.whatsapp, locale)}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true"><path d="M12 9.5c-.2 0-.5.2-.6.3-.6.7-1.3 1-2.3.6-1.1-.4-2-1.3-2.6-2.4-.3-.6-.4-1.2-.1-1.7l.4-.5c.1-.1.2-.1.3 0l.7.9c.1.1.1.3 0 .4l-.3.4c-.1.1-.1.3 0 .4.4.7 1 1.3 1.7 1.6.1.1.3 0 .4-.1l.4-.4c.1-.1.3-.1.4 0l.9.8c.1.1.2.3 0 .4z" /><path d="M8 1.5A6.5 6.5 0 0 0 2.4 11L1.5 14.5l3.6-.9A6.5 6.5 0 1 0 8 1.5z" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
        </a>
        <a href={`mailto:${content.contact.email}?subject=${encodeURIComponent("Project enquiry")}&body=${msg}`} className="btn-secondary !border-white/40 !text-[#FAF3EC] hover:!border-white hover:!text-white">
          {t(content.ui.emailUs, locale)}
        </a>
        <a href={`tel:${content.contact.phoneIntl}`} className="btn-secondary !border-white/40 !text-[#FAF3EC] hover:!border-white hover:!text-white">
          {t(content.ui.callUs, locale)}
        </a>
      </div>

      {content.contact.bookingUrl && (
        <a href={content.contact.bookingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-[#FAF3EC]/80 underline underline-offset-4 hover:text-white">
          {t(content.ui.bookCall, locale)} ↗
        </a>
      )}

      <form
        className="mt-6 grid gap-4 rounded-xl border border-white/15 p-4 md:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          window.open(`${content.contact.whatsapp}?text=${msg}`, "_blank");
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="bk-name" className="font-mono text-xs text-[#FAF3EC]/60">{isRtl ? "الاسم" : "Name"}</label>
            <input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder={isRtl ? "اسمك" : "Your name"} className="field mt-1.5 !border-white/20 !text-[#FAF3EC]" />
          </div>
          <div>
            <label htmlFor="bk-email" className="font-mono text-xs text-[#FAF3EC]/60">{isRtl ? "الإيميل" : "Email"}</label>
            <input id="bk-email" type="email" placeholder="you@company.com" className="field mt-1.5 !border-white/20 !text-[#FAF3EC]" />
          </div>
        </div>
        <div>
          <label htmlFor="bk-need" className="font-mono text-xs text-[#FAF3EC]/60">{isRtl ? "مشروعك" : "Your project"}</label>
          <textarea id="bk-need" rows={4} value={need} onChange={(e) => setNeed(e.target.value)} required placeholder={isRtl ? "موقع، متجر، نظام…" : "Website, store, system…"} className="field mt-1.5 resize-none !border-white/20 !text-[#FAF3EC]" />
        </div>
        <button type="submit" className="min-h-11 rounded-full bg-[#FAF3EC] px-6 py-3 text-sm font-bold text-[#382216] transition-colors hover:bg-white">
          {t(content.ui.sendMessage, locale)} — WhatsApp
        </button>
      </form>
    </div>
  );
}
