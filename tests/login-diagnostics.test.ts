import { beforeEach, describe, expect, it, vi } from "vitest";

/* --------------------------------------------------------------------
   Mocks. loginAction pulls in next/headers, next/navigation and the
   Supabase server client; all of those are replaced so the real action
   code (validation, failure branch, diagnostics) still executes.
   -------------------------------------------------------------------- */
const h = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(async () => ({ error: null })),
  createClient: vi.fn(),
  recordFailure: vi.fn(),
  throttledWait: vi.fn(() => 0),
  resetThrottle: vi.fn(),
  writeAuditLog: vi.fn(async () => undefined),
  verifyTurnstile: vi.fn(async () => true),
  headersGet: vi.fn((_name: string) => null as string | null),
  redirect: vi.fn(),
}));

const fakeClient = {
  auth: {
    signInWithPassword: h.signInWithPassword,
    signOut: h.signOut,
  },
};

vi.mock("next/headers", () => ({
  headers: () => ({ get: (k: string) => h.headersGet(k) }),
}));
vi.mock("next/navigation", () => ({ redirect: h.redirect }));
vi.mock("@/lib/supabase/server", () => ({ createClient: h.createClient }));
vi.mock("@/lib/supabase/env", () => ({
  hasSupabaseEnv: true,
  supabaseUrl: "",
  supabaseAnonKey: "",
  getMissingEnvError: () => "missing",
}));
vi.mock("@/lib/throttle", () => ({
  throttledWait: h.throttledWait,
  recordFailure: h.recordFailure,
  resetThrottle: h.resetThrottle,
}));
vi.mock("@/lib/audit", () => ({ writeAuditLog: h.writeAuditLog }));
vi.mock("@/lib/turnstile", () => ({ REQUIRE_MFA: false, verifyTurnstile: h.verifyTurnstile }));

import { loginAction } from "../src/app/login/actions";
import {
  LOGIN_FAILURE_EVENT,
  SUPABASE_ENV_EVENT,
  categorizeLoginFailure,
  formatLoginFailureLog,
  formatSupabaseEnvLog,
  logSupabaseEnvOnce,
  supabaseEnvDiagnostics,
} from "../src/lib/auth-diagnostics";

/** Canary values: if either ever reaches a log line, the tests fail. */
const EMAIL = "diagnostics-canary-user@example.com";
const PASSWORD = "Leak-Canary-Passw0rd-9271!";

function form(): FormData {
  const f = new FormData();
  f.set("email", EMAIL);
  f.set("password", PASSWORD);
  f.set("next", "/admin");
  return f;
}

type Payload = {
  event?: unknown;
  status?: unknown;
  code?: unknown;
  name?: unknown;
  category?: unknown;
  ts?: unknown;
};

const GENERIC = "Invalid email or password";
const CATEGORIES = ["invalid_credentials", "config_or_network", "not_admin", "throttled", "other"];

/** One attempt per failure category, each carrying the email in `message`. */
const attempts: { label: string; category: string; setup: () => void }[] = [
  {
    label: "Supabase rejects the credentials",
    category: "invalid_credentials",
    setup: () => {
      h.signInWithPassword.mockReset();
      h.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          status: 400,
          code: "invalid_credentials",
          name: "AuthApiError",
          message: `Invalid login credentials for ${EMAIL}`,
        },
      });
    },
  },
  {
    label: "signInWithPassword throws a transport error",
    category: "config_or_network",
    setup: () => {
      h.signInWithPassword.mockReset();
      h.signInWithPassword.mockRejectedValueOnce(new TypeError(`fetch failed while contacting Supabase for ${EMAIL}`));
    },
  },
  {
    label: "resolved 5xx from Supabase",
    category: "config_or_network",
    setup: () => {
      h.signInWithPassword.mockReset();
      h.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { status: 500, code: "unexpected_failure", name: "AuthApiError", message: `boom for ${EMAIL}` },
      });
    },
  },
  {
    label: "authenticated but not an admin",
    category: "not_admin",
    setup: () => {
      h.signInWithPassword.mockReset();
      h.signInWithPassword.mockResolvedValueOnce({
        data: { user: { app_metadata: { role: "user" } }, session: null },
        error: null,
      });
    },
  },
  {
    label: "Supabase rate limit",
    category: "throttled",
    setup: () => {
      h.signInWithPassword.mockReset();
      h.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          status: 429,
          code: "over_request_rate_limit",
          name: "AuthApiError",
          message: `too many attempts for ${EMAIL}`,
        },
      });
    },
  },
  {
    label: "unclassified throw",
    category: "other",
    setup: () => {
      h.signInWithPassword.mockReset();
      h.signInWithPassword.mockRejectedValueOnce(new Error(`unexpected failure while authenticating ${EMAIL}`));
    },
  },
];

beforeEach(() => {
  h.createClient.mockReset();
  h.createClient.mockReturnValue(fakeClient);
  h.signInWithPassword.mockReset();
  h.signOut.mockClear();
  h.recordFailure.mockClear();
  h.writeAuditLog.mockClear();
  h.verifyTurnstile.mockClear();
});

describe("login action: identical response across every failure category", () => {
  it("returns one and the same generic message, with no other keys", async () => {
    const captured: { level: string; text: string }[] = [];
    const errSpy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      captured.push({ level: "error", text: args.map(String).join(" ") });
    });
    const logSpy = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
      captured.push({ level: "log", text: args.map(String).join(" ") });
    });

    try {
      const seen: { label: string; category: string; response: Record<string, unknown>; payload: Payload }[] = [];

      for (const attempt of attempts) {
        const before = captured.length;
        attempt.setup();
        const response = await loginAction({}, form());
        const newLines = captured.slice(before).filter((c) => c.level === "error" && c.text.includes(LOGIN_FAILURE_EVENT));

        // Exactly ONE failure line per failed attempt.
        expect(newLines, `expected one failure line for: ${attempt.label}`).toHaveLength(1);

        const line = newLines[0]!.text;
        expect(line, "failure line must not span multiple lines").not.toMatch(/[\r\n]/);

        const payload = JSON.parse(line) as Payload;
        expect(Object.keys(payload).sort()).toEqual(["category", "code", "event", "name", "status", "ts"]);
        expect(payload.event).toBe(LOGIN_FAILURE_EVENT);
        expect(payload.category).toBe(attempt.category);
        expect(payload.status === null || typeof payload.status === "number").toBe(true);
        expect(payload.code === null || typeof payload.code === "string").toBe(true);
        expect(payload.name === null || typeof payload.name === "string").toBe(true);
        expect(typeof payload.ts).toBe("string");
        expect(new Date(payload.ts as string).toISOString()).toBe(payload.ts);
        expect(JSON.stringify(payload)).toBe(line);

        seen.push({ label: attempt.label, category: attempt.category, response, payload });
      }

      // 1) Every category was actually exercised.
      expect(new Set(seen.map((s) => s.category))).toEqual(new Set(CATEGORIES));
      expect(seen).toHaveLength(attempts.length);

      // 2) The user-facing response is byte-identical across all of them.
      const distinct = new Set(seen.map((s) => JSON.stringify(s.response)));
      expect(distinct.size).toBe(1);
      expect(seen[0]!.response).toEqual({ error: GENERIC });
      expect(seen[0]!.response.error).toBe(GENERIC);
      expect(Object.keys(seen[0]!.response)).toEqual(["error"]);
      for (const s of seen) expect(s.response).toEqual({ error: GENERIC });

      // 3) No log line anywhere leaks the canary email or password.
      const everything = captured.map((c) => c.text).join("\n");
      expect(everything.length).toBeGreaterThan(0);
      expect(everything).not.toContain(EMAIL);
      expect(everything).not.toContain(PASSWORD);
      expect(everything.toLowerCase()).not.toContain(EMAIL.toLowerCase());

      // 4) `error.message` (which echoes the email above) was never written.
      expect(everything).not.toContain("Invalid login credentials for");
      expect(everything).not.toContain("unexpected failure while authenticating");

      // 5) The env check is boolean-only and fires at most once in this flow.
      const envLines = captured.filter((c) => c.text.includes(SUPABASE_ENV_EVENT));
      expect(envLines.length).toBeLessThanOrEqual(1);
      for (const l of envLines) {
        const parsed = JSON.parse(l.text) as Record<string, unknown>;
        for (const value of Object.values(parsed)) expect(typeof value).toBe("boolean");
      }
    } finally {
      errSpy.mockRestore();
      logSpy.mockRestore();
    }
  });
});

describe("login action: one-time env check", () => {
  it("emits the boolean-only env line exactly once for repeated requests", async () => {
    vi.resetModules();
    const fresh = await import("../src/app/login/actions");
    const lines: string[] = [];
    const logSpy = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
      lines.push(args.map(String).join(" "));
    });

    try {
      h.signInWithPassword.mockReset();
      h.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { status: 400, code: "invalid_credentials", name: "AuthApiError", message: `no ${EMAIL}` },
      });

      await fresh.loginAction({}, form());
      await fresh.loginAction({}, form());
      await fresh.loginAction({}, form());

      const envLines = lines.filter((l) => l.includes(SUPABASE_ENV_EVENT));
      expect(envLines).toHaveLength(1);

      const parsed = JSON.parse(envLines[0]!) as Record<string, unknown>;
      expect(parsed[SUPABASE_ENV_EVENT]).toBe(true);
      for (const value of Object.values(parsed)) expect(typeof value === "boolean").toBe(true);
      // Booleans only means the values themselves cannot appear.
      expect(envLines[0]).not.toContain(EMAIL);
      expect(envLines[0]).not.toContain(PASSWORD);
      expect(envLines[0]).not.toContain("http");
      expect(envLines[0]).not.toContain("sb_publishable_");
    } finally {
      logSpy.mockRestore();
    }
  });
});

describe("categorizeLoginFailure", () => {
  it.each([
    ["invalid_credentials", { error: { status: 400, code: "invalid_credentials", name: "AuthApiError" } }],
    ["invalid_credentials", { error: { status: 401, code: null, name: "AuthApiError" } }],
    ["invalid_credentials", { error: { status: 404, code: "user_not_found", name: "AuthApiError" } }],
    ["config_or_network", { error: new TypeError("fetch failed") }],
    ["config_or_network", { error: { status: 500, code: "unexpected_failure", name: "AuthApiError" } }],
    ["config_or_network", { error: { status: 503, code: null, name: "AuthApiError" } }],
    ["not_admin", { error: null, notAdmin: true }],
    ["throttled", { error: { status: 429, code: "over_request_rate_limit", name: "AuthApiError" } }],
    ["other", { error: null, notAdmin: false }],
    ["other", { error: new Error("some app level failure") }],
    ["other", { error: { status: 418, code: "teapot", name: "AuthApiError" } }],
    ["other", {}],
  ] as [string, Parameters<typeof categorizeLoginFailure>[0]][])(
    "classifies as %s",
    (expected, input) => {
      expect(categorizeLoginFailure(input)).toBe(expected);
    },
  );

  it("prefers not_admin over any error state", () => {
    expect(categorizeLoginFailure({ notAdmin: true, error: { status: 400 } })).toBe("not_admin");
  });
});

describe("formatLoginFailureLog", () => {
  it("emits exactly the allowed fields, single line, deterministic timestamp", () => {
    const now = new Date("2026-10-08T10:11:12.345Z");
    const line = formatLoginFailureLog({
      error: { status: 400, code: "invalid_credentials", name: "AuthApiError", message: EMAIL },
      now,
    });
    expect(line).not.toMatch(/[\r\n]/);
    expect(line).toBe(
      JSON.stringify({
        event: "auth.login.failed",
        status: 400,
        code: "invalid_credentials",
        name: "AuthApiError",
        category: "invalid_credentials",
        ts: "2026-10-08T10:11:12.345Z",
      }),
    );
    expect(line).not.toContain(EMAIL);
    expect(line).not.toContain(PASSWORD);
  });

  it("drops free-form name/code rather than letting them through", () => {
    const line = formatLoginFailureLog({
      error: { status: 400, code: `code for ${EMAIL}`, name: `name for ${EMAIL}` },
      now: new Date("2026-10-08T10:11:12.345Z"),
    });
    const payload = JSON.parse(line) as Payload;
    expect(payload.code).toBeNull();
    expect(payload.name).toBeNull();
    expect(line).not.toContain(EMAIL);
  });

  it("never emits the error message", () => {
    const line = formatLoginFailureLog({ error: new Error(`boom ${EMAIL}`), now: new Date() });
    expect(line).not.toContain(EMAIL);
    expect(line).not.toContain("boom");
  });
});

describe("supabaseEnvDiagnostics", () => {
  it("reports only booleans and never the values themselves", () => {
    const url = "https://zqx-canary.supabase.co";
    const key = "sb_publishable_zqx-canary-key";
    const diag = supabaseEnvDiagnostics(url, key);
    for (const value of Object.values(diag)) expect(typeof value).toBe("boolean");

    const line = formatSupabaseEnvLog(diag);
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(Object.values(parsed).every((v) => typeof v === "boolean")).toBe(true);
    expect(parsed[SUPABASE_ENV_EVENT]).toBe(true);
    expect(line).not.toContain("zqx-canary");
    expect(line).not.toContain("https://");

    expect(diag).toEqual({
      urlSet: true,
      anonKeySet: true,
      urlParses: true,
      urlEndsWithSupabaseCo: true,
      keySbPublishable: true,
      keyLegacyJwt: false,
      urlEdgeWhitespace: false,
      urlOuterQuotes: false,
      keyEdgeWhitespace: false,
      keyOuterQuotes: false,
    });
  });

  it("flags a legacy JWT key, a bad URL and edge whitespace/quotes", () => {
    const diag = supabaseEnvDiagnostics("  'https://legacy.example.com'  ", "  eyJhbGciOiJIUzI1NiJ9.abc  ");
    expect(diag.urlSet).toBe(true);
    expect(diag.anonKeySet).toBe(true);
    expect(diag.urlParses).toBe(false);
    expect(diag.urlEndsWithSupabaseCo).toBe(false);
    expect(diag.keyLegacyJwt).toBe(true);
    expect(diag.keySbPublishable).toBe(false);
    expect(diag.urlEdgeWhitespace).toBe(true);
    expect(diag.urlOuterQuotes).toBe(true);
    expect(diag.keyEdgeWhitespace).toBe(true);
    expect(diag.keyOuterQuotes).toBe(false);
  });

  it("reports both values missing as false booleans", () => {
    const diag = supabaseEnvDiagnostics("", "");
    expect(diag.urlSet).toBe(false);
    expect(diag.anonKeySet).toBe(false);
    expect(diag.urlParses).toBe(false);
    expect(diag.urlEdgeWhitespace).toBe(false);
    expect(diag.keyEdgeWhitespace).toBe(false);
  });

  it("drops any non-boolean entry defensively", () => {
    const line = formatSupabaseEnvLog({ urlSet: true, leaked: "https://zqx-canary.supabase.co" as unknown as boolean });
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(Object.values(parsed).every((v) => typeof v === "boolean")).toBe(true);
    expect(parsed.leaked).toBeUndefined();
    expect(line).not.toContain("zqx-canary");
  });

  it("logs once per gate and never again", () => {
    const gate = { checked: false };
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    try {
      expect(logSupabaseEnvOnce(gate)).toBe(true);
      expect(logSupabaseEnvOnce(gate)).toBe(false);
      expect(logSupabaseEnvOnce(gate)).toBe(false);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]![0]).toContain(SUPABASE_ENV_EVENT);
    } finally {
      spy.mockRestore();
    }
  });
});
