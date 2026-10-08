"use client";

import { useState } from "react";
import type { ProjectInput } from "@/lib/validate";
import ImageUpload from "./ImageUpload";
import { Card, Field, Status, TextArea, Toggle, useSectionSave } from "./admin-ui";

type LocalKey = "en" | "ar";

function blankProject(): ProjectInput {
  return {
    slug: "",
    name: "",
    url: "",
    displayUrl: "",
    category: "",
    categoryLabel: { en: "", ar: "" },
    description: { en: "", ar: "" },
    problem: { en: "", ar: "" },
    solution: { en: "", ar: "" },
    stack: [],
    result: { en: "", ar: "" },
    featured: false,
    image: "",
  };
}

const LC: { key: LocalKey; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "ar", label: "AR" },
];

export default function ProjectsEditor({ initial }: { initial: ProjectInput[] }) {
  const { state, save, pending } = useSectionSave("projects");
  const [projects, setProjects] = useState<ProjectInput[]>(initial);
  const [stackText, setStackText] = useState<string[]>(initial.map((p) => p.stack.join(", ")));

  function patch(i: number, p: Partial<ProjectInput>) {
    setProjects((prev) => prev.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }

  function patchLocale(i: number, key: "categoryLabel" | "description" | "problem" | "solution" | "result", lang: LocalKey, value: string) {
    setProjects((prev) => prev.map((x, j) => (j === i ? { ...x, [key]: { ...x[key], [lang]: value } } : x)));
  }

  function saveAll() {
    save(projects);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-[#7A6A5F]">
          Changes apply to the live site within a minute. The field under each title selects which svg/image displays on the portfolio page.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setProjects((p) => [...p, blankProject()])} className="rounded-lg border border-[#382216]/25 px-4 py-2 text-sm hover:border-[#B5622F] hover:text-[#B5622F]">
          + Add project
        </button>
        <div className="flex items-center gap-3">
          <Status state={state} />
          <button type="button" onClick={saveAll} disabled={pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "Saving…" : "Save all projects"}
          </button>
        </div>
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-[#7A6A5F]">
          No projects yet. Add one — the public site keeps its default portfolio until you save.
        </p>
      )}

      {projects.map((p, i) => (
        <Card key={`${p.slug}-${i}`} title={`Project ${i + 1}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Slug (url path, lowercase/hyphens)" value={p.slug} onChange={(v) => patch(i, { slug: v })} placeholder="e.g. mannai-tours" />
            <Field label="Name" value={p.name} onChange={(v) => patch(i, { name: v })} placeholder="Mannai Tours" />
            <Field label="URL" value={p.url} onChange={(v) => patch(i, { url: v })} placeholder="https://…" className="md:col-span-2" />
            <Field label="Display URL" value={p.displayUrl} onChange={(v) => patch(i, { displayUrl: v })} placeholder="mannai.com" />
            <Field label="Category (used for filtering)" value={p.category} onChange={(v) => patch(i, { category: v })} placeholder="travel" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {LC.map(({ key, label }) => (
              <Field key={`cat-${key}-${i}`} label={`Category label ${label}`} value={p.categoryLabel[key]} onChange={(v) => patchLocale(i, "categoryLabel", key, v)} />
            ))}
          </div>

          <div className="border-t border-dashed border-[#382216]/15 pt-4">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-[#7A6A5F]">Copy</p>
            <div className="grid gap-4 md:grid-cols-2">
              {LC.map(({ key, label }) => (
                <TextArea key={`d-${key}-${i}`} label={`Description ${label}`} value={p.description[key]} onChange={(v) => patchLocale(i, "description", key, v)} rows={3} />
              ))}
              {LC.map(({ key, label }) => (
                <TextArea key={`pr-${key}-${i}`} label={`Problem ${label}`} value={p.problem[key]} onChange={(v) => patchLocale(i, "problem", key, v)} rows={2} />
              ))}
              {LC.map(({ key, label }) => (
                <TextArea key={`so-${key}-${i}`} label={`Solution ${label}`} value={p.solution[key]} onChange={(v) => patchLocale(i, "solution", key, v)} rows={3} />
              ))}
              {LC.map(({ key, label }) => (
                <TextArea key={`re-${key}-${i}`} label={`Result ${label}`} value={p.result[key]} onChange={(v) => patchLocale(i, "result", key, v)} rows={2} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-56 flex-1">
              <label className="block">
                <span className="font-mono text-[11px] text-[#7A6A5F]">Stack (comma separated)</span>
                <input
                  value={stackText[i] ?? ""}
                  onChange={(e) => {
                    const text = e.target.value;
                    setStackText((s) => s.map((x, j) => (j === i ? text : x)));
                    patch(i, { stack: text.split(",").map((t) => t.trim()).filter(Boolean) });
                  }}
                  className="field mt-1"
                  placeholder="Next.js, Supabase…"
                />
              </label>
            </div>
            <Toggle label="Featured" checked={p.featured} onChange={(v) => patch(i, { featured: v })} />
            <button type="button" onClick={() => setProjects((list) => list.filter((_, j) => j !== i))} className="pb-1 text-sm text-[#B5622F] underline underline-offset-4">
              Remove
            </button>
          </div>

          <ImageUpload label={`Image / visual (public URL or upload — ${p.displayUrl || "fallback:"} /projects/${p.slug || "…"}.svg)`} value={p.image ?? ""} onChange={(v) => patch(i, { image: v || undefined })} />
        </Card>
      ))}
    </div>
  );
}