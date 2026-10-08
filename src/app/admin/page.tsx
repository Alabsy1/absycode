import Link from "next/link";
import { getContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AuditRow = { id: string; action: string; detail?: string | null; target?: string | null; created_at: string };

export default async function AdminOverview() {
  let content: Awaited<ReturnType<typeof getContent>> | null = null;
  try {
    content = await getContent();
  } catch {
    // ignore — counters below handle nulls
  }

  const counts = {
    projects: content?.projects.length ?? 0,
    services: content?.services.length ?? 0,
    testimonials: content?.testimonials.length ?? 0,
    stats: content?.stats.length ?? 0,
  };

  let audit: AuditRow[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(15);
    audit = (data ?? []) as AuditRow[];
  } catch {
    audit = [];
  }

  const cards = [
    { label: "Live projects", value: counts.projects, href: "/admin/projects" },
    { label: "Live services", value: counts.services, href: "/admin/services" },
    { label: "Live testimonials", value: counts.testimonials, href: "/admin/testimonials" },
    { label: "Stats", value: counts.stats, href: "/admin/content" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-[#7A6A5F]">
          Edits save straight to your site within a minute. The public site always falls back to its built-in defaults if nothing is saved yet.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card no-underline transition-transform hover:-translate-y-0.5">
            <p className="font-mono text-[11px] text-[#7A6A5F]">{c.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{c.value}</p>
          </Link>
        ))}
      </div>

      <section className="card p-5">
        <h3 className="font-mono text-xs uppercase tracking-wide text-[#B5622F]">— Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { href: "/admin/projects", label: "Edit projects" },
            { href: "/admin/services", label: "Edit services" },
            { href: "/admin/pricing", label: "Edit estimator prices" },
            { href: "/admin/content", label: "Edit content & contact" },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="rounded-lg border border-[#382216]/25 px-4 py-2 text-sm no-underline hover:border-[#B5622F] hover:text-[#B5622F]">
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-mono text-xs uppercase tracking-wide text-[#B5622F]">— Recent activity</h3>
        {audit.length === 0 ? (
          <p className="mt-4 text-sm text-[#7A6A5F]">No audit rows yet. Logins and saves will appear here.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-[#382216]/10 text-start font-mono text-xs text-[#7A6A5F]">
                <th className="py-2 text-start font-normal">Action</th>
                <th className="py-2 text-start font-normal">Target</th>
                <th className="py-2 text-start font-normal">Detail</th>
                <th className="py-2 text-start font-normal">When</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((row) => (
                <tr key={row.id} className="border-b border-[#382216]/5 last:border-0">
                  <td className="py-2 font-mono text-xs">{row.action}</td>
                  <td className="py-2 font-mono text-xs text-[#7A6A5F]">{row.target ?? "—"}</td>
                  <td className="py-2 max-w-xs truncate font-mono text-xs text-[#7A6A5F]">{row.detail ?? "—"}</td>
                  <td className="py-2 font-mono text-xs text-[#7A6A5F]">{row.created_at ? new Date(row.created_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}