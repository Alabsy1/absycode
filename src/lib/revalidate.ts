import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Revalidates every public page that derives content from the merged site
 * config after an admin save. Public pages render static+tag-cached content,
 * so editing a record must purge both locales.
 *
 * Never throws: in non-request contexts (tests, scripts) next/cache is a
 * no-op and a throwing revalidate must not break the admin save.
 */
export function revalidateSite(): void {
  try {
    revalidateTag("content");
    revalidatePath("/", "layout");
    for (const l of ["en", "ar"] as const) {
      revalidatePath(`/${l}`);
      revalidatePath(`/${l}/contact`);
      revalidatePath(`/${l}/insights`);
    }
  } catch {
    // ignore
  }
}