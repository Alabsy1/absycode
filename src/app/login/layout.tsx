import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * WHY THIS LAYOUT EXISTS
 * ----------------------
 * `/login` lives OUTSIDE the `[locale]` segment, so it is not wrapped by
 * `src/app/[locale]/layout.tsx` - which is the only place that used to emit
 * `<html>`/`<body>`. The Next root-layout validator
 * (`next/dist/server/stream-utils/node-web-streams-helper.js:416`) scans the
 * emitted bytes for opening `<html`/`<body>` tags, finds none, and appends
 * `self.__next_root_layout_missing_tags=["html","body"]`.
 *
 * The client then takes the error branch in `next/dist/client/app-index.js:152`
 * instead of `hydrateRoot`, and React ends up pushing a second document element
 * into `document` (whose `appElement` is literally `document`,
 * app-index.js:46). That is what throws
 *   HierarchyRequestError: Only one element on document allowed
 *   NotFoundError: Failed to execute 'removeChild' on 'Node'
 * and leaves the page blank.
 *
 * WHY NOT THE ROOT LAYOUT
 * -----------------------
 * `src/app/layout.tsx` receives `params = {}` for every route (verified at
 * runtime) - it cannot see `locale`, so it cannot set `lang`/`dir`, and putting
 * `<html>` there would nest a second document inside the locale layout's own
 * `<html>`. Each top-level segment therefore owns exactly one document:
 * no nesting, no duplicated layout. The root layout stays a tag-less provider
 * of `globals.css` + metadata.
 */

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    // color-scheme: light stops auto-dark browsers from repainting this page
    // grey; the meta below does the same for the UA's form controls/scrollbars.
    // suppressHydrationWarning: browser extensions legitimately inject
    // classes/styles onto <html> and <body> after load - attribute-level only,
    // nothing else on this page uses it.
    <html lang="en" dir="ltr" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen antialiased bg-[#FAF3EC] text-[#382216]" style={{ colorScheme: "light" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
