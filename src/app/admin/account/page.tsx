import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, getMissingEnvError } from "@/lib/supabase/env";
import AccountClient from "../AccountClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminAccount() {
  if (!hasSupabaseEnv) {
    return (
      <div className="card max-w-lg p-6">
        <p className="text-sm text-[#7A6A5F]">{getMissingEnvError()}</p>
      </div>
    );
  }

  const supabase = createClient();
  const user = (await supabase.auth.getUser()).data.user;

  let aal = "unknown";
  let factors: { id: string; type: string; friendlyName?: string | null; status?: string | null }[] = [];
  try {
    const lvl = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    aal = lvl.data?.currentLevel ?? "unknown";
    const raw = (await supabase.auth.mfa.listFactors()).data?.all;
    const arr = Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : [];
    factors = arr.map((f) => ({
      id: String(f.id ?? ""),
      type: String(f.type ?? f.factor_type ?? "totp"),
      friendlyName: f.friendlyName != null ? String(f.friendlyName) : f.friendly_name != null ? String(f.friendly_name) : null,
      status: f.status != null ? String(f.status) : null,
    }));
  } catch {
    // MFA endpoints unavailable — show what we can.
  }

  return <AccountClient email={user?.email ?? ""} aal={aal} factors={factors} />;
}