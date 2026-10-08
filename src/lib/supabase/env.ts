const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;

/** True only when both env vars exist and the URL looks valid. */
export const hasSupabaseEnv = Boolean(url && anonKey && /^https:\/\/.+\.supabase\.co$/.test(url.trim()));

/**
 * Thrown by admin/auth paths when Supabase is not configured.
 * The public site never calls this — it renders from defaults instead.
 */
export function getMissingEnvError(): string {
  return "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and run npm run db:seed. See README → Admin setup.";
}