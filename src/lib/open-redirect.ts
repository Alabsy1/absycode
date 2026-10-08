/**
 * Validates and normalizes the `next` query param used on redirects after
 * login. Guards against open redirects: only same-origin relative paths
 * starting with a single "/" are allowed. Rejects "//", backslashes,
 * schemes and encoded variants. Returns `fallback` for anything unsafe.
 */
const REJECT_CHARS = /[\\\u0000-\u001f\u007f]/;

export function safeNext(raw: string | null | undefined, fallback = "/admin"): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2000) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (REJECT_CHARS.test(raw)) return fallback;

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return fallback;
  }
  // A correctly encoded variant must re-decode to the same safe shape.
  if (decoded !== raw) {
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
    if (REJECT_CHARS.test(decoded)) return fallback;
  }

  // Resolving against a throwaway origin must stay on that origin.
  try {
    const url = new URL(decoded, "https://absycode.local");
    if (url.origin !== "https://absycode.local") return fallback;
  } catch {
    return fallback;
  }

  // No parent-directory traversal ("..") allowed.
  if (decoded.split("/").includes("..")) return fallback;

  return raw.trim();
}