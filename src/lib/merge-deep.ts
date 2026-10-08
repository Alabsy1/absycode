/**
 * Deep-merge semantics used for DB-over-defaults content:
 * - objects merge recursively (defaults fill any gaps)
 * - arrays and primitives from the patch replace the base value
 * - null/undefined/empty patch values keep the base, so a DB row can never
 *   blank out content that already ships in site.ts
 * Used by the content layer (src/lib/content.ts) and covered by tests.
 */
export function mergeDeep<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined || isEmptyPatch(patch)) return base;
  if (Array.isArray(patch)) return structuredClone(patch) as T;
  if (typeof patch !== "object" || typeof base !== "object" || base === null || Array.isArray(base)) {
    return structuredClone(patch) as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (isEmptyPatch(v)) continue;
    const bv = (base as Record<string, unknown>)[k];
    const doMerge =
      bv !== null && bv !== undefined && typeof bv === "object" && !Array.isArray(bv) && v !== null && v !== undefined && typeof v === "object" && !Array.isArray(v);
    out[k] = doMerge ? mergeDeep(bv, v) : structuredClone(v);
  }
  return out as T;
}

/** A patch value that carries no information must never override a default. */
function isEmptyPatch(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length === 0;
  return false;
}
