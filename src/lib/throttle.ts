/**
 * Best-effort in-memory login throttling with progressive delay.
 *
 * Key = IP + email. Every failure multiplies the wait before the next attempt
 * (cap 30s), and a permanent lockout applies after MAX_FAILURES in the window.
 *
 * In-memory only: resets on restart and does not work across multiple server
 * instances — this is intentionally a best-effort baseline, documented as such.
 * For production hardening enable the Cloudflare Turnstile hook (TURNSTILE
 * SECRET env) which provides real distributed protection.
 */
const MAX_FAILURES = 15;
const WINDOW_MS = 10 * 60 * 1000;
const BASE_DELAY_MS = 600;
const MAX_DELAY_MS = 30_000;

type Entry = { failures: number[]; locked: boolean };

const store = new Map<string, Entry>();

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function prune() {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now - (entry.failures[entry.failures.length - 1] ?? 0) > ONE_DAY_MS) store.delete(key);
  });
}

function getKey(ip: string, email: string): string {
  return `${ip.toLowerCase()}|${email.trim().toLowerCase()}`;
}

/** Millisecond wait imposed before the next attempt is allowed. */
export function throttledWait(ip: string, email: string): number {
  prune();
  const entry = store.get(getKey(ip, email));
  if (!entry) return 0;
  if (entry.locked) return Infinity;
  const now = Date.now();
  entry.failures = entry.failures.filter((ts) => now - ts < WINDOW_MS);
  if (entry.failures.length >= MAX_FAILURES) {
    entry.locked = true;
    return Infinity;
  }
  return Math.min(BASE_DELAY_MS * Math.pow(2, Math.max(entry.failures.length - 1, 0)), MAX_DELAY_MS);
}

export function recordFailure(ip: string, email: string): void {
  const key = getKey(ip, email);
  const entry = store.get(key) ?? { failures: [], locked: false };
  entry.failures.push(Date.now());
  const now = Date.now();
  entry.failures = entry.failures.filter((ts) => now - ts < WINDOW_MS);
  if (entry.failures.length >= MAX_FAILURES) entry.locked = true;
  store.set(key, entry);
}

export function resetThrottle(ip: string, email: string): void {
  store.delete(getKey(ip, email));
}

/** Used by tests to isolate runs. */
export function clearThrottle(): void {
  store.clear();
}