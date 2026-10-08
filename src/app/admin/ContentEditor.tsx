"use client";

import { useState } from "react";
import type { ContactInput, ProcessStepInput, SiteInput, StatInput } from "@/lib/validate";
import { Card, Field, Status, TextArea, Toggle, useSectionSave } from "./admin-ui";

type LocalKey = "en" | "ar";
const LC: { key: LocalKey; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "ar", label: "AR" },
];

function blankStats(): StatInput {
  return { value: "", label: { en: "", ar: "" } };
}
function blankStep(): ProcessStepInput {
  return { n: "", title: { en: "", ar: "" }, body: { en: "", ar: "" } };
}

export default function ContentEditor({
  site,
  stats,
  process,
  contact,
}: {
  site: SiteInput;
  stats: StatInput[];
  process: ProcessStepInput[];
  contact: ContactInput;
}) {
  const siteSave = useSectionSave("site");
  const statsSave = useSectionSave("stats");
  const processSave = useSectionSave("process");
  const contactSave = useSectionSave("contact");

  const [formSite, setFormSite] = useState(site);
  const [formStats, setFormStats] = useState(stats);
  const [formProcess, setFormProcess] = useState(process);
  const [formContact, setFormContact] = useState(contact);

  const setSiteLocal = (key: "tagline" | "heroSupport" | "location", lang: LocalKey, v: string) =>
    setFormSite((s) => ({ ...s, [key]: { ...s[key], [lang]: v } }));
  const setFounder = (key: "quote" | "role", lang: LocalKey, v: string) =>
    setFormSite((s) => ({ ...s, founder: { ...s.founder, [key]: { ...s.founder[key], [lang]: v } } }));
  const setUi = (key: "finalCta" | "finalCtaBody" | "footerTag", lang: LocalKey, v: string) =>
    setFormSite((s) => ({ ...s, ui: { ...s.ui, [key]: { ...s.ui[key], [lang]: v } } }));

  function saveSite() {
    siteSave.save(formSite);
  }
  function patchStats(i: number, p: Partial<StatInput>) {
    setFormStats((arr) => arr.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }
  function patchStep(i: number, p: Partial<ProcessStepInput>) {
    setFormProcess((arr) => arr.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content &amp; contact</h1>
        <p className="mt-1 text-sm text-[#7A6A5F]">Homepage text, stats, process steps and contact details.</p>
      </div>

      <Card title="Homepage text">
        <div className="grid gap-4 md:grid-cols-2">
          {LC.map(({ key, label }) => (
            <Field key={`tag-${key}`} label={`Tagline ${label}`} value={formSite.tagline[key]} onChange={(v) => setSiteLocal("tagline", key, v)} />
          ))}
          {LC.map(({ key, label }) => (
            <TextArea key={`hero-${key}`} label={`Hero support text ${label}`} value={formSite.heroSupport[key]} onChange={(v) => setSiteLocal("heroSupport", key, v)} rows={3} />
          ))}
          {LC.map(({ key, label }) => (
            <Field key={`loc-${key}`} label={`Location ${label}`} value={formSite.location[key]} onChange={(v) => setSiteLocal("location", key, v)} />
          ))}
          {LC.map(({ key, label }) => (
            <TextArea key={`fq-${key}`} label={`Founder quote ${label}`} value={formSite.founder.quote[key]} onChange={(v) => setFounder("quote", key, v)} rows={3} />
          ))}
          {LC.map(({ key, label }) => (
            <Field key={`fr-${key}`} label={`Founder role ${label}`} value={formSite.founder.role[key]} onChange={(v) => setFounder("role", key, v)} />
          ))}
        </div>

        <div className="grid gap-4 border-t border-dashed border-[#382216]/15 pt-4 md:grid-cols-2">
          {LC.map(({ key, label }) => (
            <Field key={`cta-${key}`} label={`Final CTA title ${label}`} value={formSite.ui.finalCta[key]} onChange={(v) => setUi("finalCta", key, v)} />
          ))}
          {LC.map(({ key, label }) => (
            <TextArea key={`ctab-${key}`} label={`Final CTA body ${label}`} value={formSite.ui.finalCtaBody[key]} onChange={(v) => setUi("finalCtaBody", key, v)} rows={2} />
          ))}
          {LC.map(({ key, label }) => (
            <Field key={`foot-${key}`} label={`Footer tag ${label}`} value={formSite.ui.footerTag[key]} onChange={(v) => setUi("footerTag", key, v)} />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#382216]/15 pt-4">
          <Toggle label="Show testimonials section on homepage" checked={formSite.showTestimonials} onChange={(v) => setFormSite((s) => ({ ...s, showTestimonials: v }))} />
          <div className="flex items-center gap-3">
            <Status state={siteSave.state} />
            <button type="button" onClick={saveSite} disabled={siteSave.pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              {siteSave.pending ? "Saving…" : "Save site text"}
            </button>
          </div>
        </div>
      </Card>

      <Card title="Stats strip">
        {formStats.map((s, i) => (
          <div key={`${s.value}-${i}`} className="grid gap-3 rounded-lg border border-dashed border-[#382216]/20 p-4 md:grid-cols-3">
            <Field label="Value" value={s.value} onChange={(v) => patchStats(i, { value: v })} placeholder="120+" />
            {LC.map(({ key, label }) => (
              <Field key={`${key}-${i}`} label={`Label ${label}`} value={s.label[key]} onChange={(v) => patchStats(i, { label: { ...s.label, [key]: v } })} />
            ))}
            <button type="button" onClick={() => setFormStats((arr) => arr.filter((_, j) => j !== i))} className="text-sm text-[#B5622F] underline underline-offset-4">
              Remove
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setFormStats((arr) => [...arr, blankStats()])} className="rounded-lg border border-[#382216]/25 px-4 py-2 text-sm hover:border-[#B5622F] hover:text-[#B5622F]">
            + Add stat
          </button>
          <div className="flex items-center gap-3">
            <Status state={statsSave.state} />
            <button type="button" onClick={() => statsSave.save(formStats)} disabled={statsSave.pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              {statsSave.pending ? "Saving…" : "Save stats"}
            </button>
          </div>
        </div>
      </Card>

      <Card title="Process steps">
        {formProcess.map((p, i) => (
          <div key={`${p.n}-${i}`} className="grid gap-3 rounded-lg border border-dashed border-[#382216]/20 p-4 md:grid-cols-3">
            <Field label="Step number" value={p.n} onChange={(v) => patchStep(i, { n: v })} className="w-24" />
            {LC.map(({ key, label }) => (
              <Field key={`${key}-${i}`} label={`Title ${label}`} value={p.title[key]} onChange={(v) => patchStep(i, { title: { ...p.title, [key]: v } })} />
            ))}
            {LC.map(({ key, label }) => (
              <TextArea key={`${key}-${i}`} label={`Body ${label}`} value={p.body[key]} onChange={(v) => patchStep(i, { body: { ...p.body, [key]: v } })} rows={2} />
            ))}
            <button type="button" onClick={() => setFormProcess((arr) => arr.filter((_, j) => j !== i))} className="text-sm text-[#B5622F] underline underline-offset-4">
              Remove
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setFormProcess((arr) => [...arr, blankStep()])} className="rounded-lg border border-[#382216]/25 px-4 py-2 text-sm hover:border-[#B5622F] hover:text-[#B5622F]">
            + Add step
          </button>
          <div className="flex items-center gap-3">
            <Status state={processSave.state} />
            <button type="button" onClick={() => processSave.save(formProcess)} disabled={processSave.pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              {processSave.pending ? "Saving…" : "Save process"}
            </button>
          </div>
        </div>
      </Card>

      <Card title="Contact & linking">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Phone (display)" value={formContact.phoneDisplay} onChange={(v) => setFormContact((c) => ({ ...c, phoneDisplay: v }))} />
          <Field label="Phone (international)" value={formContact.phoneIntl} onChange={(v) => setFormContact((c) => ({ ...c, phoneIntl: v }))} />
          <Field label="WhatsApp number / link" value={formContact.whatsapp} onChange={(v) => setFormContact((c) => ({ ...c, whatsapp: v }))} className="md:col-span-2" />
          <Field label="Email" value={formContact.email} onChange={(v) => setFormContact((c) => ({ ...c, email: v }))} />
          <Field label="Instagram URL" value={formContact.instagram} onChange={(v) => setFormContact((c) => ({ ...c, instagram: v }))} />
          <Field label="Instagram handle" value={formContact.instagramHandle} onChange={(v) => setFormContact((c) => ({ ...c, instagramHandle: v }))} />
          <Field label="Facebook URL" value={formContact.facebookUrl} onChange={(v) => setFormContact((c) => ({ ...c, facebookUrl: v }))} />
          <Field label="Google Maps URL" value={formContact.mapsUrl} onChange={(v) => setFormContact((c) => ({ ...c, mapsUrl: v }))} />
          <Field label="Booking URL" value={formContact.bookingUrl} onChange={(v) => setFormContact((c) => ({ ...c, bookingUrl: v }))} />
        </div>
        <div className="flex justify-end">
          <div className="flex items-center gap-3">
            <Status state={contactSave.state} />
            <button type="button" onClick={() => contactSave.save(formContact)} disabled={contactSave.pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              {contactSave.pending ? "Saving…" : "Save contact"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}