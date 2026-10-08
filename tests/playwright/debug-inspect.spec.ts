import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(__dirname, "../../debug");

type Diagnostics = {
  consoleErrors: string[];
  consoleWarns: string[];
  pageErrors: string[];
  failedRequests: string[];
  hydrationWarnings: string[];
};

function collect(page: any): Diagnostics {
  const d: Diagnostics = {
    consoleErrors: [],
    consoleWarns: [],
    pageErrors: [],
    failedRequests: [],
    hydrationWarnings: [],
  };
  page.on("console", (msg: any) => {
    const text = msg.text();
    if (msg.type() === "error") d.consoleErrors.push(text);
    if (msg.type() === "warning") d.consoleWarns.push(text);
    if (/hydrat|did not match|Minified React error/i.test(text)) d.hydrationWarnings.push(text);
  });
  page.on("pageerror", (err: any) => d.pageErrors.push(`${err.message}\n${(err.stack || "").split("\n").slice(0, 6).join("\n")}`));
  page.on("requestfailed", (req: any) => d.failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`));
  return d;
}

async function inspect(page: any, loc: any, label: string) {
  const count = await loc.count();
  if (count === 0) {
    console.log(`${label}: NOT FOUND IN DOM`);
    return;
  }
  const info = await loc.first().evaluate((el: HTMLElement) => {
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    let node: Element | null = el;
    let effective = 1;
    while (node instanceof Element) {
      const s = window.getComputedStyle(node);
      effective *= parseFloat(s.opacity || "1");
      node = node.parentElement;
    }
    return {
      opacity: cs.opacity,
      effectiveOpacity: effective,
      visibility: cs.visibility,
      transform: cs.transform,
      display: cs.display,
      inlineStyle: el.getAttribute("style"),
      boundingBox: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
      text: (el.textContent || "").slice(0, 60),
    };
  });
  console.log(`${label}: ${JSON.stringify(info)}`);
}

async function run(page: any, locale: string) {
  const diag = collect(page);

  const ssrResp = await page.request.get(`${BASE}/${locale}`);
  const ssrHtml = await ssrResp.text();
  fs.writeFileSync(path.join(OUT, `ssr-${locale}.html`), ssrHtml);

  const ssr = {
    heroH1: ssrHtml.includes("We build the websites and systems your business runs on.") || locale === "ar",
    inlineOpacityZero: (ssrHtml.match(/style="[^"]*opacity:0/g) || []).length,
    portalMarker: ssrHtml.includes("portal.absycode.com"),
  };

  await page.goto(`/${locale}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  const hero = page.locator("section").first();
  const portalMock = page.locator("div.shadow-sm").filter({ hasText: "portal.absycode.com" }).first();

  await inspect(page, page.locator("h1").first(), `${locale} HERO H1`);
  await inspect(page, hero.locator("h1 + p").first(), `${locale} HERO P`);
  await inspect(page, hero.locator("a.btn-primary").first(), `${locale} HERO BTN1`);
  await inspect(page, hero.locator("a.btn-secondary").first(), `${locale} HERO BTN2`);
  await inspect(page, page.locator("#work h2").first(), `${locale} PORTFOLIO H2`);
  await inspect(page, page.locator("#estimator h2").first(), `${locale} ESTIMATOR H2`);
  await inspect(page, page.locator("#about blockquote").first(), `${locale} ABOUT QUOTE`);
  await inspect(page, page.locator("#process h2").first(), `${locale} PROCESS H2`);
  await inspect(page, portalMock.locator("xpath=ancestor::section[1]").locator("h2").first(), `${locale} PORTAL H2`);
  await inspect(page, portalMock, `${locale} PORTAL MOCK`);
  await inspect(page, page.locator("#contact").locator("xpath=ancestor::section[1]").locator("h2").first(), `${locale} CTA H2`);
  await inspect(page, page.locator("footer").first(), `${locale} FOOTER`);
  await inspect(page, page.locator('a[aria-label="Chat on WhatsApp"]').first(), `${locale} WHATSAPP`);
  await inspect(page, page.locator('a[href="/login"]').first(), `${locale} LOGIN`);

  const heroSection = page.locator("section").first();
  const hasCanvas = await heroSection.locator("canvas").count();
  const hasWireframeSvg = await heroSection.locator('svg[viewBox="0 0 400 400"]').count();
  const probe = await page.evaluate(() => {
    let webgl = "unknown";
    try {
      const c = document.createElement("canvas");
      const gl = (c.getContext("webgl2") ||
        c.getContext("webgl") ||
        c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      webgl = gl ? `ok(${gl.getParameter(gl.VERSION)})` : "null";
    } catch (e) {
      webgl = `throw:${(e as Error).message}`;
    }
    return {
      webgl,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory,
      saveData: (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData,
      dpr: window.devicePixelRatio,
      canvasEverywhere: document.querySelectorAll("canvas").length,
      threeChunks: performance
        .getEntriesByType("resource")
        .map((r) => r.name)
        .filter((n) => /Wireframe|three|fiber/i.test(n))
        .map((n) => n.split("/").pop()),
    };
  });

  console.log(`${locale} HERO_3D: canvas=${hasCanvas} wireframeSvg=${hasWireframeSvg} probe=${JSON.stringify(probe)}`);
  console.log(`${locale} PAGE_ERRORS: ${JSON.stringify(diag.pageErrors, null, 2)}`);
  console.log(`${locale} CONSOLE_ERRORS: ${JSON.stringify(diag.consoleErrors, null, 2)}`);
  console.log(`${locale} CONSOLE_WARNS: ${JSON.stringify(diag.consoleWarns, null, 2)}`);
  console.log(`${locale} HYDRATION: ${JSON.stringify(diag.hydrationWarnings)}`);
  console.log(`${locale} FAILED_REQUESTS: ${JSON.stringify(diag.failedRequests)}`);

  await page.screenshot({ path: path.join(OUT, `${locale}-full.png`), fullPage: true });
  await page.screenshot({ path: path.join(OUT, `${locale}-viewport.png`) });
}

test("inspect /en", async ({ page }) => {
  await run(page, "en");
});

test("inspect /ar", async ({ page }) => {
  await run(page, "ar");
});

test("inspect /en reduced-motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await run(page, "en");
});
