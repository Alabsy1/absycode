/**
 * Deep-merge semantics used for DB-over-defaults content:
 * - objects merge recursively (defaults fill any gaps)
 * - arrays and primitives from the patch replace the base value
 * - null/undefined patches keep the base
 * Used by the content layer (src/lib/content.ts) and covered by tests.
 */
export function mergeDeep<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(patch)) return structuredClone(patch) as T;
  if (typeof patch !== "object" || typeof base !== "object" || base === null || Array.isArray(base)) {
    return structuredClone(patch) as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    const bv = (base as Record<string, unknown>)[k];
    const doMerge =
      bv !== null && bv !== undefined && typeof bv === "object" && !Array.isArray(bv) && v !== null && v !== undefined && typeof v === "object" && !Array.isArray(v);
    out[k] = doMerge ? mergeDeep(bv, v) : structuredClone(v);
  }
  return out as T;
}