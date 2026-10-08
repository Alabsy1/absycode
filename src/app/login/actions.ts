"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMissingEnvError, hasSupabaseEnv } from "@/lib/supabase/env";
import { forgotSchema, loginSchema, firstIssue, verifyMfaSchema } from "@/lib/validate";
import { safeNext } from "@/lib/open-redirect";
import { throttledWait, recordFailure, resetThrottle } from "@/lib/throttle";
import { writeAuditLog } from "@/lib/audit";
import { isAdminIdentity } from "@/lib/admin-policy";
import { REQUIRE_MFA, verifyTurnstile } from "@/lib/turnstile";

const GENERIC_ERROR = "Invalid email or password";
const RESET_SENT = "If that account exists, a reset link has been sent.";

export type LoginState = {
  error?: string;
  mfaRequired?: boolean;
  factorId?: string;
  next?: string;
  success?: boolean;
};

function clientIp(): string {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return h.get("x-real-ip") ?? "unknown";
}

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Shared failure path — identical message for every failure mode. */
async function fail(ip: string, email: string, supabase: ReturnType<typeof createClient>): Promise<LoginState> {
  recordFailure(ip, email);
  try {
    await supabase.auth.signOut();
  } catch {
    // already signed out
  }
  try {
    await writeAuditLog(supabase, { action: "login_failed", detail: `email=${email}` });
  } catch {
    // best effort
  }
  return { error: GENERIC_ERROR };
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabaseEnv) return { error: getMissingEnvError() };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const ip = clientIp();
  const email = parsed.data.email.toLowerCase();

  const waitMs = throttledWait(ip, email);
  if (waitMs === Infinity) return { error: GENERIC_ERROR };
  if (waitMs > 0) await sleep(waitMs);

  const turnstileOk = await verifyTurnstile(formData.get("cf-turnstile-response")?.toString());
  if (!turnstileOk) {
    recordFailure(ip, email);
    return { error: GENERIC_ERROR };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });

  if (error || !data.user || !isAdminIdentity(data.user.app_metadata)) {
    return fail(ip, email, supabase);
  }

  if (REQUIRE_MFA) {
    const { data: lvl } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const totp = (await supabase.auth.mfa.listFactors()).data?.totp ?? [];
    if (lvl?.currentLevel !== "aal2") {
      if (totp.length > 0) {
        // Session parked at aal1 — challenge a factor before granting access.
        return { mfaRequired: true, factorId: totp[0].id, next: safeNext(parsed.data.next, "/admin") };
      }
      // REQUIRE_MFA on but no factor enrolled → refuse login. Enrol a factor
      // in the dashboard before enabling this flag (see README).
      return fail(ip, email, supabase);
    }
  }

  resetThrottle(ip, email);
  const next = safeNext(parsed.data.next, "/admin");
  try {
    await writeAuditLog(supabase, { action: "login", detail: `email=${email}` });
  } catch {
    // best effort
  }
  redirect(next);
}

export async function verifyMfaAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = verifyMfaSchema.safeParse({
    factorId: formData.get("factorId"),
    code: formData.get("code"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = createClient();
  const challenge = await supabase.auth.mfa.challenge({ factorId: parsed.data.factorId });
  if (challenge.error) return { error: "Invalid code" };
  const verify = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId: challenge.data.id,
    code: parsed.data.code,
  });
  if (verify.error) return { error: "Invalid code" };

  const next = safeNext(formData.get("next")?.toString(), "/admin");
  try {
    await writeAuditLog(supabase, { action: "login", target: "mfa" });
  } catch {
    // best effort
  }
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  if (hasSupabaseEnv) {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  redirect("/login");
}

export async function forgotPasswordAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabaseEnv) return { error: getMissingEnvError() };
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  // Identical response regardless of success — no account enumeration.
  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${siteOrigin()}/admin` });
  return { success: true, error: RESET_SENT };
}