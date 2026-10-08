/**
 * Server-side diagnostics for the login flow.
 *
 * Everything in this module writes to the SERVER console only (Vercel Runtime
 * Logs). Nothing here is ever returned to the browser, so the user-facing
 * response and the "no user enumeration" contract are untouched.
 *
 * Hard rules enforced here:
 *  1. ONE structured line per login failure, containing ONLY the fixed event
 *     name, the Supabase error `status` / `code` / `name`, a category and a
 *     timestamp.
 *  2. NEVER the email, password, token, key, IP or cookie.
 *  3. NEVER `error.message` — Supabase echoes submitted input in some AuthApi
 *     error messages, so the message is used for classification only and is
 *     not written anywhere.
 *  4. `code` and `name` are reduced to a safe token first, so a hostile or
 *     malformed error object can neither leak free text nor break the
 *     single-line format (no newlines, no control characters).
 *  5. The env check logs ONLY booleans — never the URL or the key themselves.
 */

/** Fixed event name for sign-in failures. */
export const LOGIN_FAILURE_EVENT = "auth.login.failed";
/** Key that identifies the one-time env check line; its value is a boolean. */
export const SUPABASE_ENV_EVENT = "supabase.env";

export type LoginFailureCategory =
  | "invalid_credentials"
  | "config_or_network"
  | "not_admin"
  | "throttled"
  | "other";

export type LoginFailureInput = {
  /** The Supabase AuthError, or whatever was thrown by signInWithPassword. */
  error?: unknown;
  /** True when sign-in succeeded but the identity is not an admin. */
  notAdmin?: boolean;
  /** Injectable clock, for deterministic tests. */
  now?: Date;
};

export type SupabaseEnvDiagnostics = Record<string, boolean>;

/* ------------------------------------------------------------------ */
/* Narrowing helpers — every one of these returns null rather than the  */
/* raw value, so unvetted data can never reach a log line.              */
/* ------------------------------------------------------------------ */

const SAFE_TOKEN = /^[A-Za-z0-9_.:-]{1,64}$/;

function prop(error: unknown, key: string): unknown {
  if (typeof error !== "object" || error === null) return undefined;
  return (error as Record<string, unknown>)[key];
}

function numericStatus(error: unknown): number | null {
  const raw = prop(error, "status");
  return typeof raw === "number" && Number.isFinite(raw) ? Math.trunc(raw) : null;
}

/** Free text can leak input or break the line — only tokens survive. */
function safeToken(value: unknown): string | null {
  return typeof value === "string" && SAFE_TOKEN.test(value) ? value : null;
}

/**
 * Reads `message` to classify a thrown error but never returns it, so the
 * value cannot be logged. Transport failures arrive in Node with no `status`.
 */
function looksTransport(error: unknown): boolean {
  if (safeToken(prop(error, "name")) === "TypeError") return true;
  const message = prop(error, "message");
  if (typeof message !== "string") return false;
  return /fetch|network|ECONN|ENOTFOUND|ETIMEDOUT|ESOCKET|socket|abort|timed\s*out|socket hang up/i.test(
    message,
  );
}

/* ------------------------------------------------------------------ */
/* Classification                                                      */
/* ------------------------------------------------------------------ */

export function categorizeLoginFailure(input: LoginFailureInput): LoginFailureCategory {
  if (input.notAdmin) return "not_admin";

  const error = input.error;
  if (error === null || error === undefined) {
    // The branch fired without an error object (e.g. missing user payload).
    return "other";
  }

  const status = numericStatus(error);
  const code = safeToken(prop(error, "code"));

  if (status === 429 || code === "over_request_rate_limit" || code === "over_email_send_rate_limit") {
    return "throttled";
  }

  if (status !== null) {
    if (status === 400 || status === 401 || status === 403 || status === 404) return "invalid_credentials";
    if (status >= 500) return "config_or_network";
    return "other";
  }

  if (looksTransport(error)) return "config_or_network";
  return "other";
}

/* ------------------------------------------------------------------ */
/* Failure line                                                        */
/* ------------------------------------------------------------------ */

export function formatLoginFailureLog(input: LoginFailureInput): string {
  return JSON.stringify({
    event: LOGIN_FAILURE_EVENT,
    status: numericStatus(input.error),
    code: safeToken(prop(input.error, "code")),
    name: safeToken(prop(input.error, "name")),
    category: categorizeLoginFailure(input),
    ts: (input.now ?? new Date()).toISOString(),
  });
}

/** Emits exactly one single-line entry. Never throws into the login path. */
export function logLoginFailure(input: LoginFailureInput): void {
  try {
    console.error(formatLoginFailureLog(input));
  } catch {
    // Diagnostics must never be able to break authentication.
  }
}

/* ------------------------------------------------------------------ */
/* One-time env check                                                  */
/* ------------------------------------------------------------------ */

function hasEdgeWhitespace(value: string): boolean {
  if (value.length === 0) return false;
  return /^\s/.test(value) || /\s$/.test(value);
}

function hasOuterQuotes(value: string): boolean {
  const t = value.trim();
  if (t.length < 2) return false;
  const first = t.charAt(0);
  const last = t.charAt(t.length - 1);
  return (first === '"' && last === '"') || (first === "'" && last === "'");
}

function parsesAsUrl(value: string): boolean {
  if (value.length === 0) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** Booleans only — the URL and the key themselves are never returned. */
export function supabaseEnvDiagnostics(
  rawUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
  rawKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
): SupabaseEnvDiagnostics {
  const url = rawUrl ?? "";
  const key = rawKey ?? "";
  return {
    urlSet: url.length > 0,
    anonKeySet: key.length > 0,
    urlParses: parsesAsUrl(url),
    urlEndsWithSupabaseCo: url.trim().toLowerCase().endsWith(".supabase.co"),
    keySbPublishable: key.trim().startsWith("sb_publishable_"),
    keyLegacyJwt: key.trim().startsWith("eyJ"),
    urlEdgeWhitespace: hasEdgeWhitespace(url),
    urlOuterQuotes: hasOuterQuotes(url),
    keyEdgeWhitespace: hasEdgeWhitespace(key),
    keyOuterQuotes: hasOuterQuotes(key),
  };
}

/**
 * Builds the env line. Non-boolean entries are dropped defensively, so the
 * guarantee "log only booleans" holds even if the input map is malformed.
 */
export function formatSupabaseEnvLog(diag: SupabaseEnvDiagnostics): string {
  const line: Record<string, boolean> = { [SUPABASE_ENV_EVENT]: true };
  for (const [key, value] of Object.entries(diag)) {
    if (typeof value === "boolean") line[key] = value;
  }
  return JSON.stringify(line);
}

const envGate: { checked: boolean } = { checked: false };

/**
 * Logs the env check at most once per process (first request that reaches the
 * login action). `gate` is injectable so tests can drive it without mutating
 * module state. Returns true only when this call actually logged.
 */
export function logSupabaseEnvOnce(gate: { checked: boolean } = envGate): boolean {
  if (gate.checked) return false;
  gate.checked = true;
  try {
    console.log(formatSupabaseEnvLog(supabaseEnvDiagnostics()));
  } catch {
    // Diagnostics must never break the login flow.
  }
  return true;
}
