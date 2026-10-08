import fs from "node:fs";
import path from "node:path";

export type Post = { slug: string; date: string; title_en: string; title_ar: string; excerpt_en: string; excerpt_ar: string; body: string };

function parse(raw: string): Omit<Post, "slug" | "body"> & { body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const head = m?.[1] ?? "";
  const body = m?.[2] ?? raw;
  const get = (k: string) => {
    const line = head.split("\n").find((l) => l.startsWith(k + ":"));
    return (line?.split(":").slice(1).join(":").trim().replace(/^"|"$/g, "") ?? "");
  };
  return { title_en: get("title_en"), title_ar: get("title_ar"), date: get("date"), excerpt_en: get("excerpt_en"), excerpt_ar: get("excerpt_ar"), body };
}

export function getPosts(): Post[] {
  const dir = path.join(process.cwd(), "content", "insights");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => ({ slug: f.replace(/\.md$/, ""), ...parse(fs.readFileSync(path.join(dir, f), "utf8")) }));
}

export function renderBody(body: string): string {
  // Minimal markdown: headings, lists, paragraphs (escaped).
  const esc = body.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return esc.split("\n").map((l) => {
    if (l.startsWith("## ")) return `<h2>${l.slice(3)}</h2>`;
    if (l.startsWith("# ")) return `<h1>${l.slice(2)}</h1>`;
    if (l.startsWith("- ")) return `<li>${l.slice(2)}</li>`;
    if (!l.trim()) return "";
    return `<p>${l}</p>`;
  }).join("\n").replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
}
