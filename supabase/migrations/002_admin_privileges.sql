-- 002_admin_privileges.sql
-- Lock down the admin bootstrap helper and expose a safe is_admin() predicate.
-- Idempotent: safe to run more than once, on a fresh or an already-migrated
-- project. Run it right after 001_admin_cms.sql.

/* ---- 1. set_admin_role(): only server-side/service contexts may call it --- */

-- set_admin_role() is SECURITY DEFINER and writes straight into auth.users.
-- PostgreSQL grants EXECUTE to PUBLIC by default, so until this line ran,
-- ANY holder of the publishable/anon key could call
--   select public.set_admin_role('<their own uuid>');
-- and promote themselves. Taking it away is the whole point of this file.
revoke execute on function public.set_admin_role(uuid) from public, anon, authenticated;

-- The table owner (postgres / SQL editor) keeps it implicitly, and server-side
-- code using the service role keeps an explicit grant.
grant execute on function public.set_admin_role(uuid) to service_role;

/* ---- 2. is_admin(): the predicate RLS policies are meant to use ----------- */

-- Read-only, never writes, safe to expose to anon and authenticated.
-- Returns false (never null) for callers with no JWT / no admin role.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- RLS evaluates policies under the caller's privileges, so this must stay
-- executable. Revoking it would break every admin-guarded policy that uses it.
grant execute on function public.is_admin() to anon, authenticated, service_role;

comment on function public.is_admin() is
  'True when request.jwt.claims app_metadata.role = admin. Read-only; executable by anon/authenticated.';
