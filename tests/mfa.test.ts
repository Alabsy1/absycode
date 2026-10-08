import { describe, expect, it } from "vitest";
import { verifyMfaSchema } from "../src/lib/validate";
import { REQUIRE_MFA } from "../src/lib/turnstile";

describe("MFA enforcement", () => {
  it("accepts a 6-digit numeric code with a factorId", () => {
    expect(verifyMfaSchema.safeParse({ factorId: "factor-1", code: "123456" }).success).toBe(true);
  });

  it.each([
    ["too short", "12345"],
    ["too long", "1234567"],
    ["letters", "abcdef"],
    ["mixed", "12345a"],
    ["empty", ""],
  ])("rejects an invalid code: %s", (_label, code) => {
    expect(verifyMfaSchema.safeParse({ factorId: "factor-1", code }).success).toBe(false);
  });

  it("requires a factorId", () => {
    expect(verifyMfaSchema.safeParse({ code: "123456" }).success).toBe(false);
  });

  it("MFA is off by default (REQUIRE_MFA env), so owners can still log in after setup", () => {
    expect(REQUIRE_MFA).toBe(false);
  });
});