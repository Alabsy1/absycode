import { describe, expect, it } from "vitest";
import { mergeDeep } from "../src/lib/merge-deep";
import { safeParse, siteSchema } from "../src/lib/validate";

describe("content merge: DB overrides defaults, defaults fill gaps", () => {
  const defaults = {
    tagline: { en: "Default en", ar: "Default ar" },
    heroSupport: { en: "Support" },
    showTestimonials: false,
    stats: [{ value: "10+", label: { en: "sites", ar: "مواقع" } }],
  };

  it("merges nested localized objects (patch wins per-key)", () => {
    const merged = mergeDeep(defaults, { tagline: { ar: "Edited ar" } });
    expect(merged.tagline).toEqual({ en: "Default en", ar: "Edited ar" });
  });

  it("replaces arrays wholesale (never concatenates)", () => {
    const merged = mergeDeep(mergeDeep(defaults, { showTestimonials: true }), {
      stats: [{ value: "25+", label: { en: "launches", ar: "إطلاق" } }],
    });
    expect(merged.stats).toEqual([{ value: "25+", label: { en: "launches", ar: "إطلاق" } }]);
    expect(merged).not.toMatchObject({ stats: [{ value: "10+", label: { en: "sites", ar: "مواقع" } }] });
  });

  it("keeps defaults when the patch is null/undefined", () => {
    expect(mergeDeep(defaults, null)).toEqual(defaults);
    expect(mergeDeep(defaults, undefined)).toEqual(defaults);
  });

  it("does not mutate the base through the result", () => {
    const result = mergeDeep(defaults, { tagline: { ar: "X" } });
    result.tagline.en = "mutated";
    expect(defaults.tagline.en).toBe("Default en");
  });
});

describe("content safety: junk rows keep defaults", () => {
  const fullSite = {
    tagline: { en: "a", ar: "b" },
    heroSupport: { en: "a", ar: "b" },
    location: { en: "a", ar: "b" },
    founder: { quote: { en: "a", ar: "b" }, role: { en: "a", ar: "b" } },
    ui: { finalCta: { en: "a", ar: "b" } },
    showTestimonials: false,
  };

  it("accepts a full, valid site row", () => {
    expect(safeParse(siteSchema, fullSite)).not.toBeNull();
  });

  it("a corrupted row never passes the schema, so it cannot be merged", () => {
    const corrupted = { ...fullSite, founder: { quote: { en: "a" } } }; // role missing
    expect(safeParse(siteSchema, corrupted)).toBeNull();
  });
});