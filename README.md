# AbsyCode website

Next.js (App Router) + TypeScript + Tailwind. EN (`/en`) + AR (`/ar`, RTL).

## Run

```bash
npm install
npm run dev     # http://localhost:3000 (redirects to /en)
npm run build   # must pass with no errors/warnings
npm start
```

## Content model

`src/config/site.ts` is the built-in baseline/fallback. The public site always
renders (even with no database) from this file. When a Supabase `site_settings`
row exists for a section, it **overrides** the matching default after strict
zod validation — corrupted or partial rows are ignored and defaults win.

Admin edits are made in the private dashboard at `/admin` (see below).

| What | Default in `site.ts` | Editable in admin |
|---|---|---|
| Contact (phone, WhatsApp, email, Instagram, Facebook, Maps, Calendly) | `site.contact` | Content & contact |
| Location label ("Egypt") | `site.location` | Content & contact |
| Services (6) | `site.services` | Services |
| Projects (copy, urls, featured) | `site.projects` | Projects |
| Prices & timelines (`// TODO: set real prices`) | `site.estimator` | Pricing |
| Stats placeholders | `site.stats` | Content & contact |
| Tagline, hero, founder quote/role, UI strings | `site.tagline`, …, `site.ui` | Content & contact |
| Process steps | `site.process` | Content & contact |
| Testimonials on/off | `site.showTestimonials` | Testimonials |

Blog posts: markdown files in `content/insights/`.

## Admin dashboard

Single-admin content management via Supabase (Auth + Postgres + Storage).

### 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_admin_cms.sql` (SQL editor or `supabase db push`).
   This creates `site_settings`, `admin_audit_log`, the `project-images` public
   bucket (5 MB cap, image mimes only), and the `set_admin_role()` helper.
3. Copy `.env.example` → `.env.local` and fill:

   | Var | Purpose |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API |
   | `NEXT_PUBLIC_SITE_URL` | Canonical URL (password-reset redirects) |
   | `REQUIRE_MFA` | `true` = require TOTP on admin login *(enrol a factor first, see step 5)* |
   | `TURNSTILE_SECRET` / `NEXT_PUBLIC_TURNSTILE_SITEKEY` | Optional login CAPTCHA |

4. **Create the admin user** in Supabase → Authentication → Users → *Add user*
   (email + a long password), then run once to grant the admin role:

   ```sql
   select public.set_admin_role('<the user uuid>');
   ```

   The app trusts **only** `app_metadata.role = 'admin'` (never `user_metadata`).

5. **Seed content** from the repo so the dashboard reflects the site as shipped:

   ```bash
   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<service role key> npm run db:seed
   ```

6. `npm run dev` → open `/login`, sign in. For MFA, go to `/admin/account` →
   *Set up authenticator app* → activate with a code.

### Behavior

- Editing in `/admin` saves the section to `site_settings`, writes an
  `admin_audit_log` row, and instantly invalidates the public content cache.
- The public site is fully static/no-store-free — it stays fast and never
  crashes when the DB is down (defaults kick in).
- Uploads go through `/api/admin/upload`: magic-byte sniffing (JPEG/PNG/WebP/AVIF
  only — SVG refused), 5 MB cap, auto-rotation, resize ≤1600px, EXIF stripped,
  re-encoded to WebP, random filenames.

### Security notes

- CSRF-safe server actions, `requireAdmin()` gate on every mutation, RLS as the
  final store-level gate, open-redirect-safe `next` param, progressive login
  throttle (+ optional Turnstile), no account enumeration, audit trail.
- `/admin`, `/login`, `/api/*` are `no-store` + `Vary: Cookie` and excluded
  from the locale middleware; they are noindexed in `robots.ts`.
- **npm audit:** remaining advisories are `next`-only and are only fixed in
  next 15.5.x. This repo intentionally stays on the 14.2.x (LTS-style) line with
  the patched `14.2.35`; on Vercel, keep automatic upgrades on and watch the
  project's dependency alerts.
- **CSP:** `script-src 'self' 'unsafe-inline'` — Next 14 has no nonce support;
  scope is limited to the `'self'` origin, and Supabase is the only external
  host allowed in `connect-src`. The `frame-src` whitelist in `next.config.mjs`
  must stay in sync with the domains in `src/config/site.ts` if you add projects.

## Tests

```bash
npm test    # vitest — auth gate, throttle, open redirect, zod schemas,
            # content merge/DB-down fallback, revalidation, image pipeline,
            # MFA code format, audit never-throws
```

## Notes

- Logo is a redrawn inline SVG (`src/components/Logo.tsx`, `currentColor` only — no sky blue). Favicon/OG are generated from the same mark in `public/`.
- 3D hero (`src/components/Wireframe*.tsx`) lazy-loads, disables on reduced-motion / low-end, with an SVG fallback.
- Language choice is stored in the `absy-locale` cookie (see `src/middleware.ts`).