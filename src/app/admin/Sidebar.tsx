"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdminAction } from "./actions";

const LINKS: { href: string; label: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/content", label: "Content & Contact" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/account", label: "Account" },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col border-b border-[#382216]/10 bg-[#382216] text-[#FAF3EC] md:min-h-screen md:w-60 md:border-b-0 md:border-e">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="text-lg font-bold tracking-tight">AbsyCode</span>
        <span className="rounded-full border border-[#FAF3EC]/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#FAF3EC]/70">admin</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 pb-4 md:py-2" aria-label="Admin">
        {LINKS.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm no-underline transition-colors ${
                active ? "bg-[#FAF3EC] font-semibold text-[#382216]" : "text-[#FAF3EC]/80 hover:bg-[#FAF3EC]/10 hover:text-[#FAF3EC]"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#FAF3EC]/10 px-5 py-4">
        <p className="truncate font-mono text-xs text-[#FAF3EC]/60">{email}</p>
        <div className="mt-3 flex flex-col gap-2">
          <Link href="/en" target="_blank" className="text-xs text-[#FAF3EC]/70 underline underline-offset-4 hover:text-[#FAF3EC]">
            View site ↗
          </Link>
          <form action={logoutAdminAction}>
            <button type="submit" className="text-start text-xs text-[#B5622F] underline underline-offset-4 hover:text-[#B5622F]/80">
              Log out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}