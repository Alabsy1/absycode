import { z } from "zod";

/* =====================================================================
   Zod schemas for admin input AND for guarding DB-written content before
   it is merged over the site.ts defaults. Anything that fails its schema
   keeps the default — corrupted DB rows must never break the public site.
   ===================================================================== */

const localized = z.object({ en: z.string().min(1).max(3000), ar: z.string().min(1).max(3000) });
const localizedShort = z.object({ en: z.string().min(1).max(300), ar: z.string().min(1).max(300) });

export const loginSchema = z.object({
  email: z.email("use a valid email").trim().min(3).max(254),
  password: z.string().min(8).max(128),
  next: z.string().max(2000).optional(),
});

export const forgotSchema = z.object({
  email: z.email("use a valid email").trim().min(3).max(254),
});

export const verifyMfaSchema = z.object({
  factorId: z.string().min(1).max(128),
  code: z.string().min(6).max(6).regex(/^\d{6}$/, "MFA code is 6 digits"),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase letters, numbers and hyphens only"),
  name: z.string().min(1).max(120),
  url: z.string().max(300),
  displayUrl: z.string().min(1).max(120),
  category: z.string().min(1).max(40),
  categoryLabel: localizedShort,
  description: localized,
  problem: localized,
  solution: localized,
  stack: z.array(z.string().min(1).max(60)).max(20),
  result: localized,
  featured: z.boolean(),
  image: z.string().max(600).optional(),
});
export type ProjectInput = z.infer<typeof projectSchema>;
export const projectListSchema = z.array(projectSchema).max(100);
export type ProjectListInput = z.infer<typeof projectListSchema>;

export const serviceSchema = z.object({
  key: z.string().min(1).max(60),
  icon: z.string().min(1).max(40),
  title: localized,
  body: localized,
  tags: localized,
});
export type ServiceInput = z.infer<typeof serviceSchema>;
export const serviceListSchema = z.array(serviceSchema).max(60);
export type ServiceListInput = z.infer<typeof serviceListSchema>;

export const testimonialSchema = z.object({
  quote: localized,
  name: localized,
  role: localized,
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export const testimonialListSchema = z.array(testimonialSchema).max(60);
export type TestimonialListInput = z.infer<typeof testimonialListSchema>;

export const statsSchema = z.object({
  value: z.string().min(1).max(20),
  label: localizedShort,
});
export type StatInput = z.infer<typeof statsSchema>;
export const statsListSchema = z.array(statsSchema).max(12);
export type StatListInput = z.infer<typeof statsListSchema>;

export const contactSchema = z.object({
  phoneDisplay: z.string().min(1).max(40),
  phoneIntl: z.string().min(1).max(40),
  whatsapp: z.string().min(1).max(300),
  email: z.email("use a valid email"),
  instagram: z.string().max(300),
  instagramHandle: z.string().max(60),
  facebookUrl: z.string().max(300),
  mapsUrl: z.string().max(300),
  bookingUrl: z.string().max(300),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const estimatorBaseEntry = z.object({
  key: z.string().min(1).max(40),
  priceMin: z.number().int().min(0).max(1_000_000),
  priceMax: z.number().int().min(0).max(1_000_000),
  weeksMin: z.number().int().min(1).max(104),
  weeksMax: z.number().int().min(1).max(104),
  label: localizedShort,
});
export const estimatorFeatureEntry = z.object({
  key: z.string().min(1).max(40),
  addMin: z.number().int().min(0).max(1_000_000),
  addMax: z.number().int().min(0).max(1_000_000),
  label: localizedShort,
});
export const estimatorTimelineEntry = z.object({
  key: z.string().min(1).max(40),
  mult: z.number().min(0.5).max(5),
  weeksDelta: z.number().int().min(-52).max(52),
  label: localizedShort,
});

export const estimatorSchema = z.object({
  currency: z.string().length(3),
  baseByType: z.array(estimatorBaseEntry).max(40),
  features: z.array(estimatorFeatureEntry).max(40),
  timeline: z.array(estimatorTimelineEntry).max(10),
});
export type EstimatorInput = z.infer<typeof estimatorSchema>;

export const siteSchema = z.object({
  tagline: localized,
  heroSupport: localized,
  location: localizedShort,
  founder: z.object({
    quote: localized,
    role: localized,
  }),
  ui: z.record(z.string().min(1).max(80), localized),
  showTestimonials: z.boolean(),
});
export type SiteInput = z.infer<typeof siteSchema>;

export const processStepSchema = z.object({
  n: z.string().min(1).max(8),
  title: localizedShort,
  body: localized,
});
export type ProcessStepInput = z.infer<typeof processStepSchema>;
export const processListSchema = z.array(processStepSchema).max(12);
export type ProcessListInput = z.infer<typeof processListSchema>;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Validation failed";
  const path = issue.path.length ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}

/** Parses a DB jsonb value. Returns the parsed value or null on mismatch. */
export function safeParse<T>(schema: z.ZodType<T>, value: unknown): T | null {
  const res = schema.safeParse(value);
  return res.success ? res.data : null;
}

/** True when the given write passes its schema (used to reject bad admin saves). */
export function isValid<T>(schema: z.ZodType<T>, value: unknown): value is T {
  return schema.safeParse(value).success;
}