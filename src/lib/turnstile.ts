/**
 * Optional Cloudflare Turnstile verification for the login form.
 * Disabled entirely when TURNSTILE_SECRET is absent — the site falls back to
 * its in-memory throttle for baseline protection.
 */
export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true; // disabled
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: "" }),
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean };
    return data?.success === true;
  } catch {
    return false;
  }
}

export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? "";

export const REQUIRE_MFA = process.env.REQUIRE_MFA === "true";