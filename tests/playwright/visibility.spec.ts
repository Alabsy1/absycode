import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Public-site visibility regression suite.
 *
 * Every piece of public content must be visible:
 *  - without JavaScript (SSR HTML alone)
 *  - with prefers-reduced-motion: reduce
 *  - with the Supabase database unreachable
 *
 * An element counts as visible only when Playwright's toBeVisible() passes
 * AND its computed opacity is exactly 1 (opacity: 0 is a real user-facing
 * outage even though Playwright still calls it "visible").
 */

const locales = ["en", "ar"] as const;
const modes = ["normal", "reduced-motion", "no-js", "db-unreachable"] as const;
type Mode = (typeof modes)[number];

const PORTAL_URL_MARKER = "portal.absycode.com";

function contentElements(page: Page): Record<string, Locator> {
  const hero = page.locator("section").first();
  const portalMock = page
    .locator("div.shadow-sm")
    .filter({ hasText: PORTAL_URL_MARKER })
    .first();
  const portalSection = portalMock.locator("xpath=ancestor::section[1]");
  const ctaSection = page.locator("#contact").locator("xpath=ancestor::section[1]");

  return {
    "hero h1": page.locator("h1").first(),
    "hero paragraph": hero.locator("h1 + p").first(),
    "hero button 1 (View Our Work)": hero.locator("a.btn-primary").first(),
    "hero button 2 (Discuss Your Project)": hero.locator("a.btn-secondary").first(),
    "portfolio heading": page.locator("#work h2").first(),
    "estimator heading": page.locator("#estimator h2").first(),
    "about quote": page.locator("#about blockquote").first(),
    "process heading": page.locator("#process h2").first(),
    "client portal heading": portalSection.locator("h2").first(),
    "client portal mock window": portalMock,
    "final CTA heading": ctaSection.locator("h2").first(),
    footer: page.locator("footer").first(),
    "WhatsApp button": page.locator('a[aria-label="Chat on WhatsApp"]').first(),
    'Login link (/login)': page.locator('a[href="/login"]').first(),
  };
}

async function prepare(page: Page, mode: Mode): Promise<void> {
  if (mode === "reduced-motion") {
    await page.emulateMedia({ reducedMotion: "reduce" });
  }
  if (mode === "no-js") {
    // No hydration, no client JS: only the server-rendered HTML is on screen.
    await page.route("**/_next/static/chunks/**", (route) => route.abort());
  }
  if (mode === "db-unreachable") {
    await page.route("**/*supabase*/**", (route) => route.abort());
  }
}

async function gotoAndSettle(page: Page, locale: string, mode: Mode): Promise<void> {
  await page.goto(`/${locale}`, {
    waitUntil: mode === "no-js" ? "domcontentloaded" : "networkidle",
  });
  await page.waitForTimeout(mode === "no-js" ? 300 : 1500);
}

async function expectElementVisible(name: string, locator: Locator): Promise<void> {
  await expect(locator, `${name}: must be present in the DOM (count 1)`).toHaveCount(1);
  await expect(locator, `${name}: must be visible (non-empty box, not visibility:hidden)`).toBeVisible();
  await expect(locator, `${name}: computed opacity must be 1 (0 = invisible to the user)`).toHaveCSS("opacity", "1");
  // opacity is not inherited, so a transparent ancestor also hides the element.
  const effective = await locator.evaluate((el) => {
    let opacity = 1;
    let node: Element | null = el;
    while (node instanceof Element) {
      const cs = window.getComputedStyle(node);
      if (cs.visibility === "hidden" || cs.display === "none") return 0;
      opacity *= parseFloat(cs.opacity || "1");
      node = node.parentElement;
    }
    return opacity;
  });
  expect(effective, `${name}: effective opacity of the element and all its ancestors must be 1`).toBe(1);
}

test.describe("Public content visibility", () => {
  for (const mode of modes) {
    for (const locale of locales) {
      test(`${mode} - ${locale}`, async ({ page }) => {
        const pageErrors: string[] = [];
        const consoleErrors: string[] = [];
        page.on("pageerror", (err) => pageErrors.push(err.message));
        page.on("console", (msg) => {
          if (msg.type() === "error") consoleErrors.push(msg.text());
        });

        await prepare(page, mode);
        await gotoAndSettle(page, locale, mode);

        // Without hydration nothing on this page ever animates in, so prove
        // React actually mounted whenever JS was allowed to run.
        if (mode !== "no-js") {
          const hydrated = await page.evaluate(() =>
            Object.keys(document.body).some((k) => k.startsWith("__reactFiber$")),
          );
          expect(hydrated, `React must hydrate in ${mode} on /${locale}`).toBe(true);
        }

        const elements = contentElements(page);
        const failures: string[] = [];

        for (const [name, locator] of Object.entries(elements)) {
          try {
            await expectElementVisible(name, locator);
          } catch (err) {
            failures.push(`${name}: ${(err as Error).message.split("\n").slice(0, 4).join(" | ")}`);
          }
        }

        if (pageErrors.length) {
          failures.push(`uncaught page errors: ${pageErrors.join(" ~ ")}`);
        }
        // In no-js mode the blocked chunks are expected to fail to load;
        // everything else is a real error worth failing on.
        const realConsoleErrors = mode === "no-js" ? consoleErrors.filter((e) => !e.includes("Failed to load resource")) : consoleErrors;
        if (realConsoleErrors.length) {
          failures.push(`console errors: ${realConsoleErrors.join(" ~ ")}`);
        }

        expect(failures, `invisible/unhealthy content in ${mode} on /${locale}`).toEqual([]);
      });
    }
  }
});
