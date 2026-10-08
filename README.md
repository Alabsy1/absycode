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
2. Run the migrations in the SQL editor (or `supabase db push`), **in order**:

   - `supabase/migrations/001_admin_cms.sql` — `site_settings`,
     `admin_audit_log`, the `project-images` public bucket (5 MB cap, image
     mimes only), and the `set_admin_role()` helper.
   - `supabase/migrations/002_admin_privileges.sql` — revokes `execute` on
     `set_admin_role()` from `public`, `anon` and `authenticated` (it is
     `SECURITY DEFINER`, so leaving it public would let anyone holding the
     anon key promote a user), and adds the `is_admin()` predicate.

3. Copy `.env.example` → `.env.local` and fill:

   | Var | Purpose |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API |
   | `NEXT_PUBLIC_SITE_URL` | Canonical URL (password-reset redirects) |
   | `REQUIRE_MFA` | `true` = require TOTP on admin login *(enrol a factor first — see §2.4)* |
   | `TURNSTILE_SECRET` / `NEXT_PUBLIC_TURNSTILE_SITEKEY` | Optional login CAPTCHA |

4. **Seed content** from the repo so the dashboard reflects the site as shipped:

   ```bash
   npm run db:seed            # writes supabase/seed.sql — no secret required
   ```

   Paste `supabase/seed.sql` into the Supabase SQL editor. To push straight
   from the terminal instead, put `SUPABASE_SERVICE_ROLE_KEY` in
   **`.env.seed.local`** (gitignored, deliberately separate from `.env.local`)
   and run `npm run db:seed -- --push`. The script refuses to start if the
   service-role key is found in `.env.local` — the app must only ever load the
   publishable/anon key. Verify with `npm run check:supabase`.

5. **Check function privileges** (run after both migrations). Expected:
   `set_admin_role` → anon `false` / authenticated `false`; `is_admin` →
   `true` / `true`.

   ```sql
   select
     'public.set_admin_role(uuid)' as fn, v.role,
     has_function_privilege(v.role::text, 'public.set_admin_role(uuid)'::text, 'execute') as can_execute
   from (values ('anon'), ('authenticated'), ('service_role')) as v(role)
   union all
   select
     'public.is_admin()' as fn, v.role,
     has_function_privilege(v.role::text, 'public.is_admin()'::text, 'execute') as can_execute
   from (values ('anon'), ('authenticated'), ('service_role')) as v(role)
   order by 1, 2;
   ```

### 2. Admin setup

In this exact order:

1. **Create the users in the dashboard** — Supabase → Authentication →
   Users → *Add user*, one per admin address, with **Auto Confirm User**
   checked. Type the passwords there. Passwords are never stored in this
   repo, never typed into SQL, and never checked in.

2. **Turn sign-ups OFF** — Supabase → Authentication → Sign In / Providers →
   Email → **"Allow new users to sign up" = OFF**. The app has no sign-up
   route (only `signInWithPassword`, `signOut`, MFA and
   `resetPasswordForEmail` appear under `src/`), but the Supabase-side
   toggle must also be off so nobody can self-register against the API.

3. **Run the admin grant** — copy `supabase/make-admin.example.sql` to
   `supabase/make-admin.local.sql` (gitignored: it holds real addresses),
   put the addresses in it, run it in the SQL editor. It looks each address
   up in `auth.users` **case-insensitively**, calls `set_admin_role()`,
   raises a clear `EXCEPTION` if an address is not there yet (instead of
   failing silently, and without changing anything), and ends with a
   `select` of email + role so you can confirm.

4. **Test /login** — `npm run dev`, open `/login`, sign in with one of those
   accounts; you should land in `/admin`. The app trusts **only**
   `app_metadata.role = 'admin'` (never `user_metadata`). For MFA: `/admin`
   → *Account* → *Set up authenticator app* → activate with a code.


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
- **CSP:** production `script-src 'self' 'unsafe-inline'`; `next dev` adds
  `'unsafe-eval'` only (Next 14's React refresh runtime evaluates strings —
  without it React never hydrates and every `opacity:0`-on-enter element stays
  invisible). Scope stays `'self'`-origin, with Supabase as the only external
  host in `connect-src`. The `frame-src` whitelist in `next.config.mjs` must
  stay in sync with the domains in `src/config/site.ts` if you add projects.

## Tests

```bash
npm test        # vitest — auth gate, throttle, open redirect, zod schemas,
                # content merge/DB-down fallback, revalidation, image pipeline,
                # MFA code format, audit never-throws
npm run test:e2e   # playwright — public content visibility for en/ar across
                   # normal, reduced-motion, no-JS and DB-unreachable modes
```

`.env*` files are gitignored (only `.env.example` is committed). `.env.local`
must stay publishable-key-only; anything secret belongs in `.env.seed.local`.


## Notes

- Logo is a redrawn inline SVG (`src/components/Logo.tsx`, `currentColor` only — no sky blue). Favicon/OG are generated from the same mark in `public/`.
- 3D hero (`src/components/Wireframe*.tsx`) lazy-loads, disables on reduced-motion / low-end, with an SVG fallback.
- Language choice is stored in the `absy-locale` cookie (see `src/middleware.ts`).