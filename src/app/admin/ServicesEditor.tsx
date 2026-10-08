"use client";

import { useState } from "react";
import type { ServiceInput } from "@/lib/validate";
import { Card, Field, Status, TextArea, useSectionSave } from "./admin-ui";

type LocalKey = "en" | "ar";
const LC: { key: LocalKey; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "ar", label: "AR" },
];
const ICONS = ["globe", "layers", "bag", "spark", "grid", "chart"];

function blankService(): ServiceInput {
  return { key: "", icon: "globe", title: { en: "", ar: "" }, body: { en: "", ar: "" }, tags: { en: "", ar: "" } };
}

export default function ServicesEditor({ initial }: { initial: ServiceInput[] }) {
  const { state, save, pending } = useSectionSave("services");
  const [services, setServices] = useState<ServiceInput[]>(initial);

  function patch(i: number, p: Partial<ServiceInput>) {
    setServices((prev) => prev.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }
  function patchLocale(i: number, key: "title" | "body" | "tags", lang: LocalKey, value: string) {
    setServices((prev) => prev.map((x, j) => (j === i ? { ...x, [key]: { ...x[key], [lang]: value } } : x)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="mt-1 text-sm text-[#7A6A5F]">Six services are shown on the homepage. Tags appear as small chips under each service body.</p>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setServices((s) => [...s, blankService()])} className="rounded-lg border border-[#382216]/25 px-4 py-2 text-sm hover:border-[#B5622F] hover:text-[#B5622F]">
          + Add service
        </button>
        <div className="flex items-center gap-3">
          <Status state={state} />
          <button type="button" onClick={() => save(services)} disabled={pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "Saving…" : "Save all services"}
          </button>
        </div>
      </div>

      {services.map((s, i) => (
        <Card key={`${s.key}-${i}`} title={`Service ${i + 1}`}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Key (unique id)" value={s.key} onChange={(v) => patch(i, { key: v })} placeholder="e.g. web" />
            <label className="block">
              <span className="font-mono text-[11px] text-[#7A6A5F]">Icon</span>
              <select value={s.icon} onChange={(e) => patch(i, { icon: e.target.value })} className="field mt-1">
                {ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {LC.map(({ key, label }) => (
              <Field key={`t-${key}-${i}`} label={`Title ${label}`} value={s.title[key]} onChange={(v) => patchLocale(i, "title", key, v)} />
            ))}
            {LC.map(({ key, label }) => (
              <TextArea key={`b-${key}-${i}`} label={`Body ${label}`} value={s.body[key]} onChange={(v) => patchLocale(i, "body", key, v)} rows={3} />
            ))}
            {LC.map(({ key, label }) => (
              <Field key={`g-${key}-${i}`} label={`Tags ${label} (comma separated)`} value={s.tags[key]} onChange={(v) => patchLocale(i, "tags", key, v)} />
            ))}
          </div>
          <button type="button" onClick={() => setServices((list) => list.filter((_, j) => j !== i))} className="text-sm text-[#B5622F] underline underline-offset-4">
            Remove
          </button>
        </Card>
      ))}
    </div>
  );
}