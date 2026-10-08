"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { forgotPasswordAction, loginAction, verifyMfaAction, type LoginState } from "./actions";
import { turnstileSiteKey } from "@/lib/turnstile";

const initial: LoginState = {};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
      {pending ? pendingLabel : label}
    </button>
  );
}

function Turnstile({ isMfa }: { isMfa: boolean }) {
  if (isMfa || !turnstileSiteKey) return null;
  return (
    // Turnstile injects its own iframe; sitekey from NEXT_PUBLIC_TURNSTILE_SITEKEY.
    <div
      className="cf-turnstile"
      data-sitekey={turnstileSiteKey}
      data-theme="light"
      data-size="flexible"
    />
  );
}

function TurnstileScript() {
  if (!turnstileSiteKey) return null;
  return <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer />;
}

export default function LoginForm({ next }: { next?: string }) {
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [state, dispatch] = useFormState(loginAction, initial);
  const [mfaState, mfaDispatch] = useFormState(verifyMfaAction, initial);
  const [forgotState, forgotDispatch] = useFormState(forgotPasswordAction, initial);
  const [showForgot, setShowForgot] = useState(false);

  const error = step === "credentials" ? state.error : mfaState.error;

  if (step === "mfa") {
    return (
      <form action={mfaDispatch} className="card mt-8 space-y-5 p-7">
        <TurnstileScript />
        <p className="text-sm text-[#7A6A5F]">Enter the 6-digit code from your authenticator app.</p>
        {error && <p role="alert" className="rounded-lg border border-[#B5622F]/40 bg-[#B5622F]/10 px-3 py-2 text-sm text-[#382216]">{error}</p>}
        <input type="hidden" name="factorId" value={mfaState.factorId ?? state.factorId ?? ""} />
        <input type="hidden" name="next" value={next ?? ""} />
        <div>
          <label htmlFor="mfa-code" className="font-mono text-xs text-[#7A6A5F]">Code</label>
          <input
            id="mfa-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="field mt-1.5 font-mono tracking-[0.4em]"
            placeholder="000000"
          />
        </div>
        <SubmitButton label="Verify" pendingLabel="Verifying…" />
      </form>
    );
  }

  return (
    <>
      <TurnstileScript />
      <form action={dispatch} className="card mt-8 space-y-5 p-7">
        {error && <p role="alert" className="rounded-lg border border-[#B5622F]/40 bg-[#B5622F]/10 px-3 py-2 text-sm text-[#382216]">{error}</p>}
        {state.success && <p className="rounded-lg border border-[#382216]/20 bg-[#ECE3DA] px-3 py-2 text-sm">{state.error}</p>}
        <input type="hidden" name="next" value={next ?? ""} />
        <div>
          <label htmlFor="email" className="font-mono text-xs text-[#7A6A5F]">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" className="field mt-1.5" placeholder="you@absycode.com" />
        </div>
        <div>
          <label htmlFor="password" className="font-mono text-xs text-[#7A6A5F]">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" className="field mt-1.5" placeholder="••••••••" />
        </div>
        <Turnstile isMfa={false} />
        <SubmitButton label="Log in" pendingLabel="Logging in…" />
      </form>
      <div className="mt-4 flex justify-between">
        <button type="button" onClick={() => setShowForgot(!showForgot)} className="text-sm text-[#7A6A5F] underline underline-offset-4 hover:text-[#B5622F]">
          Forgot password?
        </button>
      </div>
      {showForgot && (
        <form action={forgotDispatch} className="card mt-4 space-y-4 border-dashed p-6">
          <p className="text-sm text-[#7A6A5F]">We&apos;ll email a reset link to the address below.</p>
          {forgotState.success && <p className="rounded-lg border border-[#382216]/20 bg-[#ECE3DA] px-3 py-2 text-sm">{forgotState.error}</p>}
          {forgotState.error && !forgotState.success && <p className="text-sm text-[#B5622F]">{forgotState.error}</p>}
          <div>
            <label htmlFor="forgot-email" className="font-mono text-xs text-[#7A6A5F]">Email</label>
            <input id="forgot-email" name="email" type="email" className="field mt-1.5" placeholder="you@absycode.com" />
          </div>
          <SubmitButton label="Send reset link" pendingLabel="Sending…" />
        </form>
      )}
    </>
  );
}