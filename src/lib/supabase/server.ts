import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getMissingEnvError, hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Server-side Supabase client bound to the current request's cookies.
 * Always create a fresh client per request (never share across requests).
 * Only call from authenticated/admin paths — fails fast when env is missing.
 */
export function createClient() {
  if (!hasSupabaseEnv) throw new Error(getMissingEnvError());
  const cookieStore = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component where cookies cannot be written.
          // Middleware refreshes the session instead.
        }
      },
    },
  });
}