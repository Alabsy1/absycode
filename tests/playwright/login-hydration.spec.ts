import { expect, test, type Page } from "@playwright/test";

/**
 * Login / admin hydration regression suite.
 *
 * Bug this guards against: `src/app/layout.tsx` (the root layout) returned
 * `children` without an <html>/<body> wrapper, so every route OUTSIDE
 * `[locale]` (`/login`, `/admin`) was served with
 * `self.__next_root_layout_missing_tags=["html","body"]`. Next patched the
 * DOM outside React, React's hydration then tried to remove a node it did not
 * own, and the browser threw
 *   NotFoundError: Failed to execute 'removeChild' on 'Node'
 * which crashed React and left a blank, dark page.
 *
 * Rules: zero pageerror, zero console.error, zero hydration warnings, and the
 * server must actually emit <html> and <body> for these routes.
 */

const routes = ["/login", "/admin"] as const;
const modes = ["normal", "reduced-motion"] as const;

const HYDRATION_RE =
  /hydrat|did not match|expected server html|text content does not match|removechild|notfounderror|not a child of this node|root_layout_missing_tags/i;

type Capture = {
  pageErrors: string[];
  consoleErrors: string[];
  consoleWarns: string[];
  hydration: string[];
  anyError: string[];
};

function attach(page: Page): Capture {
  const cap: Capture = {
    pageErrors: [],
    consoleErrors: [],
    consoleWarns: [],
    hydration: [],
    anyError: [],
  };

  page.on("pageerror", (err) => {
    const entry = `[pageerror] ${err.message}\n  stack: ${String(err.stack ?? "(none)").replace(/\n/g, "\n  ")}`;
    cap.pageErrors.push(entry);
    cap.anyError.push(entry);
  });

  page.on("console", (msg) => {
    const loc = msg.location();
    const where = loc && loc.url ? ` @ ${loc.url}:${loc.lineNumber}:${loc.columnNumber}` : "";
    const text = msg.text();
    const type = msg.type();

    if (type === "error") {
      const entry = `[console.error] ${text}${where}`;
      cap.consoleErrors.push(entry);
      cap.anyError.push(entry);
    } else if (type === "warning") {
      cap.consoleWarns.push(`[console.warn] ${text}${where}`);
    }

    if (HYDRATION_RE.test(text)) {
      cap.hydration.push(`[${type}] ${text}${where}`);
    }
  });

  return cap;
}

function count(html: string, tag: "html" | "body"): { open: number; close: number } {
  const open = (html.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;
  const close = (html.match(new RegExp(`</${tag}>`, "g")) ?? []).length;
  return { open, close };
}

function dump(label: string, lines: string[]): void {
  if (!lines.length) return;
  console.log(`\n===== ${label} (${lines.length}) =====`);
  for (const line of lines) console.log(line);
}

async function runRoute(page: Page, routePath: string, mode: string): Promise<void> {
  const cap = attach(page);

  if (mode === "reduced-motion") {
    await page.emulateMedia({ reducedMotion: "reduce" });
  }

  // Raw server HTML, fetched before any client JS runs.
  const ssrResponse = await page.request.get(routePath);
  const ssrHtml = await ssrResponse.text();
  const ssrHtmlTags = count(ssrHtml, "html");
  const ssrBodyTags = count(ssrHtml, "body");

  const response = await page.goto(routePath, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const hydratedHtml = await page.content();
  const finalUrl = page.url();

  console.log(`\n===== ${routePath} [${mode}] =====`);
  console.log(`  status: ${response?.status()}  final url: ${finalUrl}`);
  console.log(
    `  SSR   <html> open/close: ${ssrHtmlTags.open}/${ssrHtmlTags.close}   <body> open/close: ${ssrBodyTags.open}/${ssrBodyTags.close}`,
  );
  console.log(
    `  DOM   <html> count: ${await page.locator("html").count()}   <body> count: ${await page.locator("body").count()}   children of body: ${await page.evaluate(() => document.body.children.length)}`,
  );
  console.log(
    `  hydrated: ${await page.evaluate(() => Object.keys(document.body).some((k) => k.startsWith("__reactFiber$")))}`,
  );
  console.log(
    `  body background: ${await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)}  color-scheme: ${await page.evaluate(() => window.getComputedStyle(document.documentElement).colorScheme)}`,
  );
  console.log(
    `  missing-tags marker in SSR: ${ssrHtml.includes("__next_root_layout_missing_tags")}`,
  );

  // Next's dev overlay mounts into <nextjs-portal> (shadow DOM) when an
  // unhandled runtime error happens; it does not always reach console/pageerror.
  const overlay = await page.evaluate(() => {
    const root = document.querySelector("nextjs-portal")?.shadowRoot;
    if (!root) return null;
    let text = "";
    const walk = (node: Node): void => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = (child as Element).tagName;
          if (tag === "STYLE" || tag === "SCRIPT" || tag === "LINK") continue;
          walk(child);
        } else if (child.nodeType === Node.TEXT_NODE) {
          text += `${child.textContent ?? ""} `;
        }
      }
    };
    walk(root);
    text = text.replace(/\s+/g, " ").trim();
    return text ? text.slice(0, 1500) : "(mounted but empty)";
  });
  console.log(`  next dev overlay: ${overlay ? `PRESENT -> ${overlay}` : "(none)"}`);

  dump("SSR html/head/body tags", [
    `  <html> open=${ssrHtmlTags.open} close=${ssrHtmlTags.close}  <body> open=${ssrBodyTags.open} close=${ssrBodyTags.close}`,
  ]);
  dump("pageerror", cap.pageErrors);
  dump("console.error", cap.consoleErrors);
  dump("console.warn", cap.consoleWarns);
  dump("hydration / removeChild warnings", cap.hydration);

  const failures: string[] = [];
  if (cap.pageErrors.length) failures.push(`${cap.pageErrors.length} uncaught pageerror(s)`);
  if (cap.consoleErrors.length) failures.push(`${cap.consoleErrors.length} console.error(s)`);
  if (cap.hydration.length) failures.push(`${cap.hydration.length} hydration/removeChild warning(s)`);
  if (overlay) failures.push(`Next dev overlay reported an error: ${overlay.slice(0, 200)}`);
  if (ssrHtmlTags.open === 0) failures.push("SSR contains no <html> opening tag");
  if (ssrBodyTags.open === 0) failures.push("SSR contains no <body> opening tag");
  if (ssrHtml.includes("__next_root_layout_missing_tags")) {
    failures.push('SSR sets self.__next_root_layout_missing_tags=["html","body"]');
  }

  expect(failures, `${routePath} [${mode}] must be hydration-clean`).toEqual([]);
}

test.describe("Login/admin hydration", () => {
  for (const mode of modes) {
    for (const routePath of routes) {
      test(`${mode} - ${routePath} has no pageerror or hydration warning`, async ({ page }) => {
        await runRoute(page, routePath, mode);
      });
    }
  }
});
