"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, getMissingEnvError } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/supabase/admin";
import { writeAuditLog, type AuditAction } from "@/lib/audit";
import { revalidateSite } from "@/lib/revalidate";
import { firstIssue } from "@/lib/validate";
import {
  contactSchema,
  estimatorSchema,
  processListSchema,
  projectListSchema,
  serviceListSchema,
  siteSchema,
  statsListSchema,
  testimonialListSchema,
} from "@/lib/validate";

export type AdminState = { error?: string; success?: string };

const SECTION = z.enum([
  "site",
  "contact",
  "estimator",
  "projects",
  "services",
  "testimonials",
  "stats",
  "process",
]);
const SectionKey = z.enum(["site", "contact", "estimator", "projects", "services", "testimonials", "stats", "process"]);

const SCHEMAS: Record<z.infer<typeof SectionKey>, z.ZodType> = {
  site: siteSchema,
  contact: contactSchema,
  estimator: estimatorSchema,
  projects: projectListSchema,
  services: serviceListSchema,
  testimonials: testimonialListSchema,
  stats: statsListSchema,
  process: processListSchema,
};

const AUDIT_ACTION: Record<z.infer<typeof SectionKey>, AuditAction> = {
  site: "content_update",
  contact: "content_update",
  estimator: "estimator_update",
  projects: "project_update",
  services: "service_update",
  testimonials: "testimonial_update",
  stats: "content_update",
  process: "content_update",
};

/**
 * Saves one full section to site_settings. Validates with zod server-side,
 * requires an admin, records an audit row, and revalidates the public site.
 */
export async function saveSectionAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const sectionResult = SECTION.safeParse(formData.get("section"));
  if (!sectionResult.success) return { error: "Unknown section" };

  const rawPayload = formData.get("payload")?.toString() ?? "";
  if (rawPayload.length > 500_000) return { error: "Payload too large" };
  let payload: unknown;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    return { error: "Malformed payload" };
  }

  const schema = SCHEMAS[sectionResult.data];
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: sectionResult.data, value: parsed.data }, { onConflict: "key" });
  if (error) return { error: error.message };

  try {
    await writeAuditLog(supabase, { action: AUDIT_ACTION[sectionResult.data], target: sectionResult.data });
  } catch {
    // ignore
  }
  revalidateSite();
  return { success: `${sectionResult.data} saved` };
}

export async function logoutAdminAction(): Promise<void> {
  const { supabase } = await requireAdmin();
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  redirect("/login");
}

/* ------------------------------- MFA ---------------------------------- */

export async function enrollMfaAction(): Promise<AdminState & { totp?: { id: string; secret: string; uri: string } }> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
  if (error || !data?.totp) return { error: "Could not start enrolment" };
  try {
    await writeAuditLog(supabase, { action: "mfa_enrolled", target: data.id });
  } catch {
    // ignore
  }
  return { success: "Enrolment started", totp: { id: data.id, secret: data.totp.secret, uri: data.totp.uri } };
}

export async function activateMfaAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const factorId = formData.get("factorId")?.toString() ?? "";
  const code = formData.get("code")?.toString() ?? "";
  if (!factorId || !/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code" };

  const { supabase } = await requireAdmin();
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) return { error: "Verification failed" };
  const verify = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code });
  if (verify.error) return { error: "Code is incorrect" };
  revalidateSite();
  return { success: "MFA enabled" };
}

export async function disableMfaAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const factorId = formData.get("factorId")?.toString() ?? "";
  if (!factorId) return { error: "Missing factor" };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) return { error: error.message };
  try {
    await writeAuditLog(supabase, { action: "mfa_disabled", target: factorId });
  } catch {
    // ignore
  }
  return { success: "MFA disabled" };
}

export async function getAdminStatus(): Promise<{ missingEnv: boolean; error?: string }> {
  if (!hasSupabaseEnv) return { missingEnv: true, error: getMissingEnvError() };
  return { missingEnv: false };
}