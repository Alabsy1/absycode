import { describe, expect, it } from "vitest";
import { safeNext } from "../src/lib/open-redirect";

describe("open redirect protection", () => {
  it("accepts safe same-origin relative paths", () => {
    expect(safeNext("/admin")).toBe("/admin");
    expect(safeNext("/en/work/anubis-kite")).toBe("/en/work/anubis-kite");
    expect(safeNext("/admin/projects")).toBe("/admin/projects");
  });

  it("falls back for null / empty / nonsense", () => {
    expect(safeNext(undefined)).toBe("/admin");
    expect(safeNext(null)).toBe("/admin");
    expect(safeNext("")).toBe("/admin");
    expect(safeNext(5 as unknown as string)).toBe("/admin");
  });

  it("rejects protocol-relative, scheme, and backslash URLs", () => {
    expect(safeNext("//evil.com")).toBe("/admin");
    expect(safeNext("///evil.com")).toBe("/admin");
    expect(safeNext("https://evil.com")).toBe("/admin");
    expect(safeNext("http:evil.com")).toBe("/admin");
    expect(safeNext("javascript:alert(1)")).toBe("/admin");
    expect(safeNext("data:text/html,x")).toBe("/admin");
    expect(safeNext("\\evil.com")).toBe("/admin");
    expect(safeNext("/\\evil.com")).toBe("/admin");
  });

  it("rejects traversal and encoded bypass attempts", () => {
    expect(safeNext("../secret")).toBe("/admin");
    expect(safeNext("/../secret")).toBe("/admin");
    expect(safeNext("%2F%2Fevil.com")).toBe("/admin");
    expect(safeNext("/%2f%2fevil.com")).toBe("/admin");
    expect(safeNext("/..%2f..%2fetc%2fpasswd")).toBe("/admin");
  });
});