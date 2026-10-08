/* eslint-disable no-console */
/**
 * db:seed — pushes the repo's src/config/site.ts values into site_settings.
 * This is the canonical way to get real content into Supabase so the admin
 * dashboard has an accurate starting point.
 *
 *   npm run db:seed        # requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Service-role bypasses RLS, so this script never needs a signed-in admin.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { site } from "../src/config/site";
import {
  contactSchema,
  estimatorSchema,
  processListSchema,
  projectListSchema,
  serviceListSchema,
  siteSchema,
  statsListSchema,
  testimonialListSchema,
} from "../src/lib/validate";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const siteValue = {
  tagline: site.tagline,
  heroSupport: site.heroSupport,
  location: site.location,
  founder: { quote: site.founder.quote, role: site.founder.role },
  ui: { ...site.ui },
  showTestimonials: site.showTestimonials,
};

const sections: { key: string; value: unknown }[] = [
  { key: "projects", value: site.projects },
  { key: "services", value: site.services },
  { key: "testimonials", value: site.testimonials },
  { key: "stats", value: site.stats },
  { key: "process", value: site.process },
  { key: "site", value: siteValue },
  { key: "contact", value: site.contact },
  { key: "estimator", value: site.estimator },
];

const schemas: Record<string, { safeParse: (v: unknown) => { success: boolean } }> = {
  projects: projectListSchema,
  services: serviceListSchema,
  testimonials: testimonialListSchema,
  stats: statsListSchema,
  process: processListSchema,
  site: siteSchema,
  contact: contactSchema,
  estimator: estimatorSchema,
};

async function main() {
  // Guarded above: url and key are non-null after the early exit.
  const supabase = createClient(url as string, key as string, { auth: { persistSession: false } });

  // Replace everything so the DB mirrors site.ts exactly.
  const { error: delErr } = await supabase.from("site_settings").delete().neq("key", "__never__");
  if (delErr) {
    console.error("Failed to clear site_settings:", delErr.message);
    process.exit(1);
  }

  for (const section of sections) {
    const schema = schemas[section.key];
    const parsed = schema.safeParse(section.value);
    if (!parsed.success) {
      console.error(`Section "${section.key}" failed its schema — skipping (won't break anything).`);
      continue;
    }
    const { error } = await supabase.from("site_settings").upsert(
      { key: section.key, value: section.value },
      { onConflict: "key" },
    );
    if (error) {
      console.error(`Failed to upsert "${section.key}":`, error.message);
      process.exit(1);
    }
    console.log(`✔ ${section.key}`);
  }

  console.log("\nSeed complete. The admin dashboard now mirrors src/config/site.ts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});