import { beforeEach, describe, expect, it } from "vitest";
import { clearThrottle, recordFailure, resetThrottle, throttledWait } from "../src/lib/throttle";

const IP = "203.0.113.7";
const EMAIL = "admin@absycode.com";

beforeEach(() => clearThrottle());

describe("throttling", () => {
  it("allows the first attempt with no delay", () => {
    expect(throttledWait(IP, EMAIL)).toBe(0);
  });

  it("imposes a progressive delay that grows with each failure (cap 30s)", () => {
    let last = 0;
    for (let i = 1; i <= 14; i++) {
      recordFailure(IP, EMAIL);
      const wait = throttledWait(IP, EMAIL);
      expect(wait).toBeGreaterThanOrEqual(last);
      if (wait < 30_000) {
        expect(wait).toBeGreaterThan(last); // still growing
      } else {
        expect(wait).toBe(30_000); // capped
      }
      last = wait;
    }
  });

  it("locks the key permanently after the failure budget (15) is spent", () => {
    for (let i = 0; i < 15; i++) recordFailure(IP, EMAIL);
    expect(throttledWait(IP, EMAIL)).toBe(Infinity);
    expect(throttledWait(IP, EMAIL)).toBe(Infinity); // stays locked
  });

  it("resets the budget on a successful login", () => {
    recordFailure(IP, EMAIL);
    recordFailure(IP, EMAIL);
    expect(throttledWait(IP, EMAIL)).toBeGreaterThan(0);
    resetThrottle(IP, EMAIL);
    expect(throttledWait(IP, EMAIL)).toBe(0);
  });

  it("keys by IP+email so other attempts are unaffected", () => {
    recordFailure(IP, EMAIL);
    expect(throttledWait(IP, EMAIL)).toBeGreaterThan(0);
    expect(throttledWait(IP, "other@absycode.com")).toBe(0);
    expect(throttledWait("198.51.100.9", EMAIL)).toBe(0);
  });
});