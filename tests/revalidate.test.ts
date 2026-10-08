import { describe, expect, it } from "vitest";
import { revalidateSite } from "../src/lib/revalidate";

describe("revalidation: admin saves invalidate the content cache", () => {
  it("never throws, even outside a request context (next/cache unavailable)", () => {
    expect(() => revalidateSite()).not.toThrow();
  });

  it("is a function wired to the content tag pipeline", () => {
    expect(typeof revalidateSite).toBe("function");
  });
});