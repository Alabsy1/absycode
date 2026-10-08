-- 001_admin_cms.sql
-- Tables, RLS and storage for the AbsyCode admin dashboard.
-- Run this against your Supabase project (SQL editor or `supabase db push`).

/* ----------------------------- site_settings --------------------------- */

create table if not exists public.site_settings (
  key          text primary key,
  value        jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Anyone may read published content (public site reads with the anon key)…
create policy "site_settings read for anon"
  on public.site_settings for select
  using (true);

-- …but only the admin may write. This mirrors the app-layer requireAdmin()
-- guard: rows are only writable by a user whose JWT app_metadata.role is 'admin'.
create policy "site_settings write for admin"
  on public.site_settings for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

/* --------------------------- admin_audit_log --------------------------- */

create table if not exists public.admin_audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references auth.users (id) on delete cascade,
  actor_email  text,
  action       text not null,
  target       text,
  detail       text,
  created_at   timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

create policy "audit_log write for admin"
  on public.admin_audit_log for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "audit_log read for admin"
  on public.admin_audit_log for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

/* --------------------------- storage: images --------------------------- */

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
)
on conflict (id) do nothing;

-- Public read on published images.
create policy "project_images read public"
  on storage.objects for select
  using (bucket_id = 'project-images');

-- Admin-only upload/delete. SVG is refused by the app layer and these mimes.
create policy "project_images upload for admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-images' and
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "project_images delete for admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-images' and
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

/* ----------------------- helper: set the admin role ---------------------- */

-- After creating the admin user in the dashboard, run once:
--   select public.set_admin_role('<the user uuid>');
create or replace function public.set_admin_role(uid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  where id = uid;
$$;