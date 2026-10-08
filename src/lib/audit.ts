import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction =
  | "login"
  | "login_failed"
  | "logout"
  | "mfa_enrolled"
  | "mfa_disabled"
  | "project_create"
  | "project_update"
  | "project_delete"
  | "service_update"
  | "estimator_update"
  | "content_update"
  | "testimonial_update"
  | "image_upload";

/**
 * Records an admin action in admin_audit_log. Never throws — a broken audit
 * row must not block the actual save.
 */
export async function writeAuditLog(
  supabase: SupabaseClient,
  entry: { action: AuditAction; target?: string; detail?: string },
): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("admin_audit_log").insert({
      action: entry.action,
      target: entry.target ?? null,
      detail: entry.detail ?? null,
      actor_id: data?.user?.id ?? null,
      actor_email: data?.user?.email ?? null,
    });
  } catch {
    // ignore — audit is best-effort
  }
}