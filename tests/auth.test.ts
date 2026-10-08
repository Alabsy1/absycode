import { describe, expect, it } from "vitest";
import { loginSchema } from "../src/lib/validate";
import { isAdminIdentity } from "../src/lib/admin-policy";

describe("authentication: accept/reject on login input", () => {
  it("accepts a well-formed email + password", () => {
    const res = loginSchema.safeParse({ email: "admin@absycode.com", password: "correct-horse-1" });
    expect(res.success).toBe(true);
  });

  it.each([
    ["not-an-email", "correct-horse-1"],
    ["admin@absycode.com", "short"],
    ["", "correct-horse-1"],
    ["admin@absycode.com", ""],
    ["admin@absycode.com".repeat(40), "correct-horse-1"], // email > 254 chars
    [null, "correct-horse-1"],
    ["admin@absycode.com", null],
    [12345, "correct-horse-1"],
  ])("rejects invalid login (%p / %p)", (email, password) => {
    expect(loginSchema.safeParse({ email, password }).success).toBe(false);
  });
});

describe("identity policy: admin role lives only in app_metadata", () => {
  it("accepts role=admin in app_metadata", () => {
    expect(isAdminIdentity({ role: "admin" })).toBe(true);
  });

  it("rejects role=admin in user_metadata only", () => {
    expect(isAdminIdentity({ role: "user" })).toBe(false);
    expect(isAdminIdentity(null)).toBe(false);
    expect(isAdminIdentity(undefined)).toBe(false);
    expect(isAdminIdentity({})).toBe(false);
  });
});