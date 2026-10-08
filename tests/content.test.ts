import { describe, expect, it } from "vitest";
import { mergeDeep } from "../src/lib/merge-deep";
import { safeParse, siteSchema, validPart } from "../src/lib/validate";

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

describe("content merge: empty DB values never blank out the site", () => {
  const defaults = {
    tagline: { en: "Default en", ar: "Default ar" },
    stats: [{ value: "10+", label: { en: "sites", ar: "مواقع" } }],
  };

  it("keeps the default when the patch string is empty or whitespace", () => {
    expect(mergeDeep(defaults, { tagline: { en: "", ar: "   " } }).tagline).toEqual(defaults.tagline);
  });

  it("keeps the default when the patch object or array is empty", () => {
    expect(mergeDeep(defaults, { tagline: {} }).tagline).toEqual(defaults.tagline);
    expect(mergeDeep(defaults, { stats: [] }).stats).toEqual(defaults.stats);
  });

  it("still applies the non-empty fields of a mixed patch", () => {
    expect(mergeDeep(defaults, { tagline: { en: "New en", ar: "" } }).tagline).toEqual({
      en: "New en",
      ar: "Default ar",
    });
  });
});

describe("content merge: per-field validation (a bad field does not drop the row)", () => {
  it("keeps the valid fields of a partially invalid site row", () => {
    const row = {
      tagline: { en: "New en", ar: "" }, // ar empty -> invalid for `localized`
      heroSupport: { en: "", ar: "" }, // both invalid -> field dropped
      location: { en: "Cairo", ar: "القاهرة" }, // valid -> applied
    };
    const parsed = validPart(siteSchema, row) as Record<string, unknown> | undefined;
    expect(parsed).toBeDefined();
    expect(parsed!.tagline).toEqual({ en: "New en" });
    expect(parsed!.heroSupport).toBeUndefined();
    expect(parsed!.location).toEqual({ en: "Cairo", ar: "القاهرة" });
  });

  it("returns undefined for a completely unusable row", () => {
    expect(validPart(siteSchema, "not an object")).toBeUndefined();
    expect(validPart(siteSchema, { tagline: { en: "", ar: "" } })).toBeUndefined();
  });

  it("a row that keeps only valid fields never blanks the defaults when merged", () => {
    const parsed = validPart(siteSchema, { tagline: { en: "New en", ar: "" } });
    const merged = mergeDeep(
      { tagline: { en: "Default en", ar: "Default ar" } },
      parsed,
    );
    expect(merged.tagline).toEqual({ en: "New en", ar: "Default ar" });
  });
});