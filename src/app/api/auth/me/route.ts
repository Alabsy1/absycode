import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public endpoint used by DashboardLink. Returns ONLY whether the visitor is
 * an admin — never user data. no-store so the header never serves stale auth.
 */
export async function GET() {
  let isAdmin = false;
  if (hasSupabaseEnv) {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      isAdmin = data?.user?.app_metadata?.role === "admin";
    } catch {
      isAdmin = false;
    }
  }
  return NextResponse.json(
    { isAdmin },
    { headers: { "Cache-Control": "no-store, max-age=0", Vary: "Cookie" } },
  );
}