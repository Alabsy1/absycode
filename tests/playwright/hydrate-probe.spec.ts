import { expect, test } from "@playwright/test";

test("the public site hydrates and is interactive", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const hydrated = await page.evaluate(() => {
    const header = document.querySelector("header");
    const keys = header ? Object.keys(header) : [];
    return {
      headerReactKeys: keys.filter((k) => k.startsWith("__react")).slice(0, 3),
      anyReactKeys: Array.from(document.querySelectorAll("*"))
        .slice(0, 400)
        .some((el) => Object.keys(el).some((k) => k.startsWith("__reactFiber$"))),
      canvasInHero: document.querySelectorAll("section canvas").length,
      revealShown: document.querySelectorAll(".reveal-shown").length,
      revealHidden: document.querySelectorAll(".reveal-hidden").length,
      revealCount: document.querySelectorAll(".reveal").length,
    };
  });

  console.log("HYDRATION_PROBE:", JSON.stringify(hydrated));
  console.log("PAGE_ERRORS:", JSON.stringify(errors, null, 2));

  // Interaction proof: opening the mobile menu only works once React is mounted.
  await page.setViewportSize({ width: 400, height: 800 });
  const menuBtn = page.locator('button[aria-label="Menu"]');
  const before = await page.locator('nav[aria-label="Mobile"]').count();
  await menuBtn.click();
  await page.waitForTimeout(300);
  const after = await page.locator('nav[aria-label="Mobile"]').count();
  console.log("INTERACTION: mobileMenu before=", before, "after=", after);

  expect(after).toBeGreaterThan(before);
});
