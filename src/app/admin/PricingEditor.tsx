"use client";

import { useState } from "react";
import type { EstimatorInput } from "@/lib/validate";
import { Card, Field, Status, useSectionSave } from "./admin-ui";

type LocalKey = "en" | "ar";
const LC: { key: LocalKey; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "ar", label: "AR" },
];

function blankBase() {
  return { key: "", priceMin: 0, priceMax: 0, weeksMin: 1, weeksMax: 1, label: { en: "", ar: "" } };
}
function blankFeature() {
  return { key: "", addMin: 0, addMax: 0, label: { en: "", ar: "" } };
}
function blankTimeline() {
  return { key: "", mult: 1, weeksDelta: 0, label: { en: "", ar: "" } };
}

export default function PricingEditor({ initial }: { initial: EstimatorInput }) {
  const { state, save, pending } = useSectionSave("estimator");
  const [currency, setCurrency] = useState(initial.currency);
  const [baseByType, setBaseByType] = useState(initial.baseByType);
  const [features, setFeatures] = useState(initial.features);
  const [timeline, setTimeline] = useState(initial.timeline);

  function patchBase(i: number, p: Partial<(typeof baseByType)[number]>) {
    setBaseByType((arr) => arr.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }
  function patchFeature(i: number, p: Partial<(typeof features)[number]>) {
    setFeatures((arr) => arr.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }
  function patchTimeline(i: number, p: Partial<(typeof timeline)[number]>) {
    setTimeline((arr) => arr.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }

  function saveAll() {
    save({ currency, baseByType, features, timeline });
  }

  const num = (v: string) => parseInt(v, 10) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estimator prices</h1>
        <p className="mt-1 text-sm text-[#7A6A5F]">Drives the live price estimate on the contact page. Amounts are in the currency below; week ranges set the timeline.</p>
      </div>

      <div className="flex items-center justify-between">
        <label className="block">
          <span className="font-mono text-[11px] text-[#7A6A5F]">Currency (3-letter code)</span>
          <input value={currency} maxLength={3} onChange={(e) => setCurrency(e.target.value.toUpperCase())} className="field mt-1 w-28 font-mono uppercase" />
        </label>
        <div className="flex items-center gap-3">
          <Status state={state} />
          <button type="button" onClick={saveAll} disabled={pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "Saving…" : "Save estimator"}
          </button>
        </div>
      </div>

      <Card title="Base prices by project type">
        {baseByType.map((b, i) => (
          <div key={`${b.key}-${i}`} className="grid gap-3 rounded-lg border border-dashed border-[#382216]/20 p-4 md:grid-cols-6">
            <Field label="Key" value={b.key} onChange={(v) => patchBase(i, { key: v })} className="md:col-span-2" />
            <Field label="Price min" type="number" value={String(b.priceMin)} onChange={(v) => patchBase(i, { priceMin: num(v) })} />
            <Field label="Price max" type="number" value={String(b.priceMax)} onChange={(v) => patchBase(i, { priceMax: num(v) })} />
            <Field label="Weeks min" type="number" value={String(b.weeksMin)} onChange={(v) => patchBase(i, { weeksMin: num(v) })} />
            <Field label="Weeks max" type="number" value={String(b.weeksMax)} onChange={(v) => patchBase(i, { weeksMax: num(v) })} />
            <div className="grid gap-3 md:col-span-3">
              {LC.map(({ key, label }) => (
                <Field key={`${key}-${i}`} label={`Label ${label}`} value={b.label[key]} onChange={(v) => patchBase(i, { label: { ...b.label, [key]: v } })} />
              ))}
            </div>
            <div className="md:col-span-3">
              <button type="button" onClick={() => setBaseByType((arr) => arr.filter((_, j) => j !== i))} className="text-sm text-[#B5622F] underline underline-offset-4">
                Remove
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setBaseByType((arr) => [...arr, blankBase()])} className="rounded-lg border border-[#382216]/25 px-4 py-2 text-sm hover:border-[#B5622F] hover:text-[#B5622F]">
          + Add base type
        </button>
      </Card>

      <Card title="Add-on features">
        {features.map((f, i) => (
          <div key={`${f.key}-${i}`} className="grid gap-3 rounded-lg border border-dashed border-[#382216]/20 p-4 md:grid-cols-5">
            <Field label="Key" value={f.key} onChange={(v) => patchFeature(i, { key: v })} className="md:col-span-2" />
            <Field label="Add min" type="number" value={String(f.addMin)} onChange={(v) => patchFeature(i, { addMin: num(v) })} />
            <Field label="Add max" type="number" value={String(f.addMax)} onChange={(v) => patchFeature(i, { addMax: num(v) })} />
            <div className="grid gap-3 md:col-span-2">
              {LC.map(({ key, label }) => (
                <Field key={`${key}-${i}`} label={`Label ${label}`} value={f.label[key]} onChange={(v) => patchFeature(i, { label: { ...f.label, [key]: v } })} />
              ))}
            </div>
            <div className="md:col-span-5">
              <button type="button" onClick={() => setFeatures((arr) => arr.filter((_, j) => j !== i))} className="text-sm text-[#B5622F] underline underline-offset-4">
                Remove
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setFeatures((arr) => [...arr, blankFeature()])} className="rounded-lg border border-[#382216]/25 px-4 py-2 text-sm hover:border-[#B5622F] hover:text-[#B5622F]">
          + Add feature
        </button>
      </Card>

      <Card title="Timeline modes">
        {timeline.map((t, i) => (
          <div key={`${t.key}-${i}`} className="grid gap-3 rounded-lg border border-dashed border-[#382216]/20 p-4 md:grid-cols-5">
            <Field label="Key" value={t.key} onChange={(v) => patchTimeline(i, { key: v })} className="md:col-span-2" />
            <Field label="Multiplier (0.5–5)" type="number" step="0.05" value={String(t.mult)} onChange={(v) => patchTimeline(i, { mult: parseFloat(v) || 1 })} />
            <Field label="Weeks delta (±)" type="number" value={String(t.weeksDelta)} onChange={(v) => patchTimeline(i, { weeksDelta: num(v) })} />
            <div className="grid gap-3 md:col-span-2">
              {LC.map(({ key, label }) => (
                <Field key={`${key}-${i}`} label={`Label ${label}`} value={t.label[key]} onChange={(v) => patchTimeline(i, { label: { ...t.label, [key]: v } })} />
              ))}
            </div>
            <div className="md:col-span-5">
              <button type="button" onClick={() => setTimeline((arr) => arr.filter((_, j) => j !== i))} className="text-sm text-[#B5622F] underline underline-offset-4">
                Remove
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setTimeline((arr) => [...arr, blankTimeline()])} className="rounded-lg border border-[#382216]/25 px-4 py-2 text-sm hover:border-[#B5622F] hover:text-[#B5622F]">
          + Add timeline mode
        </button>
      </Card>
    </div>
  );
}