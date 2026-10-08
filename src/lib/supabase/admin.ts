import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "./server";
import { isAdminIdentity } from "../admin-policy";

/** Error carrying an HTTP status for route handlers. */
export class AdminAuthError extends Error {
  readonly status: 401 | 403;
  constructor(status: 401 | 403, message: string) {
    super(message);
    this.status = status;
    this.name = "AdminAuthError";
  }
}

/**
 * Verifies the request is an authenticated, admin-role user.
 * The single gate every server action and /api/admin handler must use.
 *
 * - Not signed in / expired / invalid token  → throws 401
 * - Signed in but not an admin               → throws 403
 *
 * Role is read ONLY from app_metadata.role, never user_metadata. The sole
 * real source of truth remains this server-side check — middleware + layout
 * checks are defense in depth.
 */
export async function requireAdmin(): Promise<{ user: User; supabase: SupabaseClient }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new AdminAuthError(401, "Not authenticated");
  if (!isAdminIdentity(data.user.app_metadata)) throw new AdminAuthError(403, "Not authorized");
  return { user: data.user, supabase };
}