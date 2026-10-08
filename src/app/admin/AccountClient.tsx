"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { activateMfaAction, disableMfaAction, enrollMfaAction, type AdminState } from "./actions";
import { REQUIRE_MFA } from "@/lib/turnstile";

function Btn({ label, pendingLabel = "Working…" }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
      {pending ? pendingLabel : label}
    </button>
  );
}

type Factor = { id: string; type: string; friendlyName?: string | null; status?: string | null };

export default function AccountClient({
  email,
  aal,
  factors,
}: {
  email: string;
  aal: string;
  factors: Factor[];
}) {
  const [enrollState, enrollDispatch] = useFormState<AdminState & { totp?: { id: string; secret: string; uri: string } }, FormData>(enrollMfaAction, {});
  const [activateState, activateDispatch] = useFormState<AdminState, FormData>(activateMfaAction, {});
  const [disableState, disableDispatch] = useFormState<AdminState, FormData>(disableMfaAction, {});
  const [showSecret, setShowSecret] = useState(false);

  const verified = factors.filter((f) => f.status === "verified");
  const mfaEnabled = verified.length > 0;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-[#7A6A5F]">Signed in as {email}. Changes here don&apos;t affect the public site.</p>
      </div>

      <section className="card p-5">
        <h3 className="font-mono text-xs uppercase tracking-wide text-[#B5622F]">— Profile</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between border-b border-[#382216]/5 pb-2">
            <dt className="text-[#7A6A5F]">Email</dt>
            <dd className="font-mono">{email}</dd>
          </div>
          <div className="flex justify-between border-b border-[#382216]/5 pb-2">
            <dt className="text-[#7A6A5F]">Role</dt>
            <dd className="font-mono">admin</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#7A6A5F]">Current auth level</dt>
            <dd className="font-mono">{aal}</dd>
          </div>
        </dl>
      </section>

      <section className="card p-5">
        <h3 className="font-mono text-xs uppercase tracking-wide text-[#B5622F]">— Two-factor authentication (TOTP)</h3>
        <p className="mt-2 text-sm text-[#7A6A5F]">
          Enforced for login only when REQUIRE_MFA=true in your env. Enrol any time — it protects the dashboard now and is ready for enforcement later.
        </p>

        {enrollState.error && <p className="mt-4 rounded-lg border border-[#B5622F]/40 bg-[#B5622F]/10 px-3 py-2 text-sm">{enrollState.error}</p>}
        {enrollState.success && !enrollState.totp && <p className="mt-4 rounded-lg border border-[#382216]/20 bg-[#ECE3DA] px-3 py-2 text-sm">✓ {enrollState.success}</p>}

        {enrollState.totp && (
          <div className="mt-4 rounded-lg border border-dashed border-[#382216]/25 p-4">
            <p className="text-sm text-[#7A6A5F]">Add this to your authenticator app, then enter a code to activate.</p>
            <button type="button" onClick={() => setShowSecret(!showSecret)} className="mt-3 font-mono text-xs text-[#B5622F] underline underline-offset-4">
              {showSecret ? "Hide secret" : "Show secret & URI"}
            </button>
            {showSecret && (
              <div className="mt-3 space-y-2 font-mono text-xs">
                <p>Secret: <span className="break-all tracking-wider">{enrollState.totp.secret}</span></p>
                <p className="break-all">URI: {enrollState.totp.uri}</p>
              </div>
            )}
            <form action={activateDispatch} className="mt-4 flex items-end gap-3">
              <input type="hidden" name="factorId" value={enrollState.totp.id} />
              <div className="flex-1">
                <label htmlFor="code" className="font-mono text-[11px] text-[#7A6A5F]">6-digit code</label>
                <input id="code" name="code" inputMode="numeric" maxLength={6} className="field mt-1 font-mono tracking-[0.4em]" placeholder="000000" />
              </div>
              <Btn label="Activate" />
            </form>
            {activateState.error && <p className="mt-3 text-sm text-[#B5622F]">{activateState.error}</p>}
          </div>
        )}

        {!mfaEnabled && !enrollState.totp && (
          <form action={enrollDispatch} className="mt-4">
            <Btn label="Set up authenticator app" pendingLabel="Preparing…" />
          </form>
        )}

        {mfaEnabled && (
          <div className="mt-4 space-y-3">
            <p className="text-sm">
              <span className="rounded-full border border-[#382216]/20 bg-[#ECE3DA] px-3 py-1 font-mono text-xs">MFA active · {verified.length} factor{(verified.length === 1 ? "" : "s")}</span>
            </p>
            {verified.map((f) => (
              <form key={f.id} action={disableDispatch} className="flex items-center gap-3">
                <input type="hidden" name="factorId" value={f.id} />
                <span className="flex-1 font-mono text-sm">{f.friendlyName || f.type}</span>
                <button type="submit" className="text-sm text-[#B5622F] underline underline-offset-4">
                  Disable
                </button>
              </form>
            ))}
            {disableState.error && <p className="text-sm text-[#B5622F]">{disableState.error}</p>}
          </div>
        )}

        <p className="mt-5 border-t border-dashed border-[#382216]/15 pt-4 font-mono text-[11px] text-[#7A6A5F]">
          REQUIRE_MFA = {REQUIRE_MFA ? "true — new logins must pass a TOTP code" : "false — password only for now"}
        </p>
      </section>

      <section className="card p-5">
        <h3 className="font-mono text-xs uppercase tracking-wide text-[#B5622F]">— Danger zone</h3>
        <p className="mt-2 text-sm text-[#7A6A5F]">Removing all admin rows from the database restores the built-in site defaults.</p>
        <p className="mt-2 font-mono text-[11px] text-[#7A6A5F]">SQL: delete from site_settings;</p>
      </section>
    </div>
  );
}