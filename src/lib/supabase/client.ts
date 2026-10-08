"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Browser-side Supabase client for interactive auth flows (login, MFA, admin
 * interactive features). Returns null when env is missing so public pages
 * degrade silently instead of crashing.
 */
export function createClient() {
  if (!hasSupabaseEnv) return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}