"use client";

import { useRef, useState } from "react";

/**
 * Uploads an image to the project-images bucket via /api/admin/upload and
 * returns the public URL through onChange. SVG and oversized files are
 * rejected by the server; the local <input> mirrors those limits.
 */
export default function ImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file) return;
    if (file.type && !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setError("JPEG, PNG, WebP or AVIF only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max 5 MB.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="font-mono text-[11px] text-[#7A6A5F]">{label}</span>
      <div className="flex items-start gap-3">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-[#382216]/15 bg-[#ECE3DA]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-[#7A6A5F]">none</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…or upload"
            className="field w-full font-mono text-xs"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="rounded-lg border border-[#382216]/25 px-3 py-1.5 text-sm disabled:opacity-60"
            >
              {busy ? "Uploading…" : "Upload"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="px-2 text-sm text-[#B5622F] underline underline-offset-4">
                Clear
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }} />
        </div>
      </div>
      {error && <p className="text-xs text-[#B5622F]">{error}</p>}
    </div>
  );
}