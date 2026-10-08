import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://absycode.com"),
  title: { default: "AbsyCode — Websites & systems your business runs on", template: "%s · AbsyCode" },
  description: "AbsyCode builds fast websites, business systems, e-commerce, AI automation and client portals.",
};

/**
 * DELIBERATELY RENDERS NO <html>/<body>.
 *
 * `params = {}` here for every route (verified at runtime), so this layout
 * cannot know `locale` and cannot set `lang`/`dir`. Each top-level segment owns
 * its own single document instead:
 *   - `src/app/[locale]/layout.tsx`  → public site, `lang={locale} dir=…`
 *   - `src/app/login/layout.tsx`     → /login
 *   - `src/app/admin/layout.tsx`     → /admin
 * Do NOT add `<html>` here: it would nest a second document inside the ones
 * above, which is the failure Next reports as a missing-root-layout-tag and
 * React surfaces as HierarchyRequestError / removeChild NotFoundError.
 * The root layout only supplies globals.css, metadata and the shared cache of
 * server components.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
