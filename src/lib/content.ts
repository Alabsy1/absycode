import { unstable_cache } from "next/cache";
import type { ZodType } from "zod";
import { site, type SiteConfig } from "@/config/site";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { mergeDeep } from "@/lib/merge-deep";
import {
  contactSchema,
  estimatorSchema,
  processListSchema,
  projectListSchema,
  serviceListSchema,
  siteSchema,
  statsListSchema,
  testimonialListSchema,
} from "@/lib/validate";
import { safeParse } from "@/lib/validate";

/* =====================================================================
   Content merge layer.

   site.ts is the baseline/fallback. Rows in `site_settings` override it.
   - The public site renders from defaults when the DB is empty/unreachable.
   - Only rows that pass their zod schema are applied — junk never ships.
   - consumer pages render from a tag-cached copy of the merged config;
     admin saves revalidateTag("content") to publish edits instantly.
   ===================================================================== */

type Row = { key: string; value: unknown };

const EDITABLE = new Set(["site", "contact", "estimator", "projects", "services", "testimonials", "stats", "process"]);

const SCHEMAS: Record<string, ZodType> = {
  projects: projectListSchema,
  services: serviceListSchema,
  testimonials: testimonialListSchema,
  stats: statsListSchema,
  process: processListSchema,
  site: siteSchema,
  contact: contactSchema,
  estimator: estimatorSchema,
};

function buildMerged(rows: Row[]): SiteConfig {
  let cfg: SiteConfig = structuredClone(site);
  for (const row of rows) {
    const key = row.key;
    if (!EDITABLE.has(key)) continue;
    const schema = SCHEMAS[key];
    if (!schema) continue;
    const value = safeParse(schema, row.value);
    if (value !== null) cfg = mergeDeep(cfg, value);
  }
  return cfg;
}

async function fetchRows(): Promise<Row[]> {
  if (!hasSupabaseEnv) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase.from("site_settings").select("key, value");
    return Array.isArray(data) ? (data as Row[]) : [];
  } catch {
    // DB down or configured badly — fall back to defaults, never break.
    return [];
  }
}

function getContentUncached(): Promise<SiteConfig> {
  return fetchRows().then(buildMerged);
}

/**
 * Merged site config for server components. Cached (60s) and tagged
 * "content" so admin saves publish immediately via revalidateSite().
 * Public pages never crash on DB failure — they get site.ts defaults.
 */
export const getContent: () => Promise<SiteConfig> = unstable_cache(getContentUncached, ["site-content"], {
  revalidate: 60,
  tags: ["content"],
});

/** Raw editable rows for the dashboard (no merge, no cache). */
export async function getContentRows(): Promise<Row[]> {
  return fetchRows();
}