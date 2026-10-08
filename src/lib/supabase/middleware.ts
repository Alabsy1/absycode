import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { getMissingEnvError, hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Supabase client for the Next.js middleware. Reads cookies from the incoming
 * request and records refreshed tokens so the caller can write them to BOTH
 * the mutated request (for downstream rendering) and the outgoing response
 * (for the browser Set-Cookie).
 */
export type MiddlewareCookieChange = { name: string; value: string; options?: Record<string, unknown> };

export function createMiddlewareClient(req: NextRequest, changes: MiddlewareCookieChange[] = []) {
  if (!hasSupabaseEnv) throw new Error(getMissingEnvError());
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet) => {
        changes.length = 0;
        for (const { name, value, options } of cookiesToSet) {
          changes.push({ name, value, options });
          req.cookies.set(name, value);
        }
      },
    },
  });
}