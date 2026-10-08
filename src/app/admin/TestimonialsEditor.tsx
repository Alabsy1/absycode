"use client";

import { useState } from "react";
import type { TestimonialInput } from "@/lib/validate";
import { Card, Status, TextArea, useSectionSave } from "./admin-ui";

type LocalKey = "en" | "ar";
const LC: { key: LocalKey; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "ar", label: "AR" },
];

function blankTestimonial(): TestimonialInput {
  return { quote: { en: "", ar: "" }, name: { en: "", ar: "" }, role: { en: "", ar: "" } };
}

export default function TestimonialsEditor({ initial }: { initial: TestimonialInput[] }) {
  const { state, save, pending } = useSectionSave("testimonials");
  const [items, setItems] = useState<TestimonialInput[]>(initial);

  function patch(i: number, p: Partial<TestimonialInput>) {
    setItems((arr) => arr.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
        <p className="mt-1 text-sm text-[#7A6A5F]">
          Shown when &quot;Show testimonials&quot; is on (Content &amp; contact page). Your site ships with zero testimonials by default.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setItems((arr) => [...arr, blankTestimonial()])} className="rounded-lg border border-[#382216]/25 px-4 py-2 text-sm hover:border-[#B5622F] hover:text-[#B5622F]">
          + Add testimonial
        </button>
        <div className="flex items-center gap-3">
          <Status state={state} />
          <button type="button" onClick={() => save(items)} disabled={pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "Saving…" : "Save all testimonials"}
          </button>
        </div>
      </div>

      {items.map((t, i) => (
        <Card key={`${t.name.en}-${i}`} title={`Testimonial ${i + 1}`}>
          <div className="grid gap-4 md:grid-cols-2">
            {LC.map(({ key, label }) => (
              <TextArea key={`q-${key}-${i}`} label={`Quote ${label}`} value={t.quote[key]} onChange={(v) => patch(i, { quote: { ...t.quote, [key]: v } })} rows={3} />
            ))}
            <div>
              <span className="font-mono text-[11px] text-[#7A6A5F]">Name &amp; role</span>
              <div className="mt-1 grid gap-3 md:grid-cols-2">
                {LC.map(({ key, label }) => (
                  <div key={`nr-${key}-${i}`} className="space-y-1">
                    <label className="font-mono text-[10px] text-[#7A6A5F]">Name {label}</label>
                    <input value={t.name[key]} onChange={(v) => patch(i, { name: { ...t.name, [key]: v.target.value } })} className="field" />
                  </div>
                ))}
                {LC.map(({ key, label }) => (
                  <div key={`rr-${key}-${i}`} className="space-y-1">
                    <label className="font-mono text-[10px] text-[#7A6A5F]">Role {label}</label>
                    <input value={t.role[key]} onChange={(v) => patch(i, { role: { ...t.role, [key]: v.target.value } })} className="field" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setItems((arr) => arr.filter((_, j) => j !== i))} className="text-sm text-[#B5622F] underline underline-offset-4">
            Remove
          </button>
        </Card>
      ))}
    </div>
  );
}