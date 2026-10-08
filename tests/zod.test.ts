import { describe, expect, it } from "vitest";
import {
  contactSchema,
  estimatorSchema,
  processListSchema,
  projectSchema,
  serviceSchema,
  siteSchema,
  statsSchema,
  testimonialSchema,
} from "../src/lib/validate";
import { safeParse } from "../src/lib/validate";

const L = { en: "English", ar: "عربي" };

describe("projects", () => {
  const valid = {
    slug: "anubis-kite",
    name: "Anubis Kite",
    url: "https://anubiskite.com",
    displayUrl: "anubiskite.com",
    category: "travel",
    categoryLabel: { en: "Travel", ar: "سفر" },
    description: L,
    problem: L,
    solution: L,
    result: L,
    stack: ["Next.js", "Supabase"],
    featured: false,
    image: "https://abc.supabase.co/storage/v1/object/public/project-images/x.webp",
  };

  it("accepts a fully valid project", () => {
    expect(projectSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["missing name", { ...valid, name: "" }],
    ["missing displayUrl", { ...valid, displayUrl: "" }],
    ["uppercase slug", { ...valid, slug: "Anubis-Kite" }],
    ["empty stack entry", { ...valid, stack: [""] }],
    ["missing title in localized", { ...valid, description: { ar: "عربي" } }],
    ["name too long", { ...valid, name: "x".repeat(121) }],
  ])("rejects invalid project: %s", (_label, bad) => {
    expect(projectSchema.safeParse(bad).success).toBe(false);
  });
});

describe("services / testimonials / stats / process", () => {
  it("accepts valid records", () => {
    expect(
      serviceSchema.safeParse({ key: "web", icon: "globe", title: L, body: L, tags: L }).success,
    ).toBe(true);
    expect(testimonialSchema.safeParse({ quote: L, name: L, role: L }).success).toBe(true);
    expect(statsSchema.safeParse({ value: "120+", label: { en: "done", ar: "منجز" } }).success).toBe(true);
    expect(processListSchema.safeParse([{ n: "01", title: L, body: L }]).success).toBe(true);
  });

  it("rejects bad records", () => {
    expect(serviceSchema.safeParse({ key: "", icon: "globe", title: L, body: L, tags: L }).success).toBe(false);
    expect(testimonialSchema.safeParse({ quote: L, name: L, role: { ar: "" } }).success).toBe(false);
    expect(statsSchema.safeParse({ value: "", label: L }).success).toBe(false);
    expect(processListSchema.safeParse([{ n: "", title: L, body: L }]).success).toBe(false);
  });
});

describe("contact", () => {
  const valid = {
    phoneDisplay: "+20 100 000 0000",
    phoneIntl: "+201000000000",
    whatsapp: "201000000000",
    email: "hello@absycode.com",
    instagram: "https://instagram.com/abscode",
    instagramHandle: "abscode",
    facebookUrl: "",
    mapsUrl: "",
    bookingUrl: "",
  };

  it("accepts a valid contact block", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
});

describe("estimator", () => {
  const valid = {
    currency: "USD",
    baseByType: [
      { key: "website", priceMin: 600, priceMax: 1200, weeksMin: 2, weeksMax: 4, label: { en: "Site", ar: "موقع" } },
    ],
    features: [{ key: "cms", addMin: 150, addMax: 300, label: { en: "CMS", ar: "سي ام اس" } }],
    timeline: [{ key: "urgent", mult: 1.25, weeksDelta: -1, label: { en: "Urgent", ar: "مستعجل" } }],
  };

  it("accepts a valid estimator block", () => {
    expect(estimatorSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["bad currency", { ...valid, currency: "US" }],
    ["negative price", { ...valid, baseByType: [{ ...valid.baseByType[0], priceMin: -5 }] }],
    ["zero weeks", { ...valid, baseByType: [{ ...valid.baseByType[0], weeksMin: 0 }] }],
    ["multiplier too high", { ...valid, timeline: [{ ...valid.timeline[0], mult: 9 }] }],
    ["empty label", { ...valid, features: [{ ...valid.features[0], label: { en: "", ar: "" } }] }],
  ])("rejects invalid estimator: %s", (_label, bad) => {
    expect(estimatorSchema.safeParse(bad).success).toBe(false);
  });
});

describe("partial/junk DB rows must never apply", () => {
  it("rejects a partial site row (deepPartial is NOT accepted)", () => {
    const partialSite = { tagline: { en: "Hi" } }; // missing heroSupport etc.
    expect(safeParse(siteSchema, partialSite)).toBeNull();
  });

  it("safeParse returns null for non-object junk", () => {
    expect(safeParse(serviceSchema, "garbage")).toBeNull();
    expect(safeParse(serviceSchema, 42)).toBeNull();
    expect(safeParse(serviceSchema, {})).toBeNull();
  });
});