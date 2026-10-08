"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveSectionAction, type AdminState } from "./actions";

export type { AdminState };

export function useSectionSave(section: string) {
  const [state, dispatch, pending] = useFormState<AdminState, FormData>(saveSectionAction, {});
  const save = (payload: unknown) => {
    const fd = new FormData();
    fd.set("section", section);
    fd.set("payload", JSON.stringify(payload));
    dispatch(fd);
  };
  return { state, save, pending };
}

export function SaveButton({ pendingLabel = "Saving…" }: { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
      {pending ? pendingLabel : "Save"}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  name,
  placeholder,
  type = "text",
  step,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  name?: string;
  placeholder?: string;
  type?: string;
  step?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="font-mono text-[11px] text-[#7A6A5F]">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field mt-1"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 2,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="font-mono text-[11px] text-[#7A6A5F]">{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="field mt-1 resize-none" />
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#B5622F]" />
      {label}
    </label>
  );
}

export function Status({ state }: { state: AdminState }) {
  if (state.success)
    return <p className="rounded-lg border border-[#382216]/20 bg-[#ECE3DA] px-3 py-2 text-sm">✓ {state.success}</p>;
  if (state.error) return <p className="rounded-lg border border-[#B5622F]/40 bg-[#B5622F]/10 px-3 py-2 text-sm text-[#382216]">{state.error}</p>;
  return null;
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 md:p-6">
      <h3 className="font-mono text-xs uppercase tracking-wide text-[#B5622F]">— {title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}