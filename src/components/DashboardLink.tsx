"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { t, type Locale } from "@/i18n";

/**
 * Conditional admin link shown in the public header/footer.
 * Calls /api/auth/me (no-store) which returns ONLY { isAdmin } — no user
 * data leaks to public pages. Renders nothing when not an admin.
 */
export default function DashboardLink({ locale }: { locale: Locale }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store", headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : { isAdmin: false }))
      .then((d) => {
        if (mounted && d?.isAdmin === true) setIsAdmin(true);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <Link href="/admin" className="text-sm font-medium text-[#382216] no-underline transition-colors hover:text-[#B5622F]">
      {t(site.ui.dashboard, locale)}
    </Link>
  );
}