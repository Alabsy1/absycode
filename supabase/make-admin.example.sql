-- make-admin.example.sql  (COMMITTED TEMPLATE - safe, placeholder addresses)
--
-- Copy to supabase/make-admin.local.sql (gitignored), put your real addresses
-- in it, and run THAT file in the Supabase SQL editor.
--
-- WHEN TO RUN: AFTER creating every account in
--   Supabase -> Authentication -> Users -> Add user  (Auto Confirm User checked).
-- WHY AFTER:  the script only finds accounts that already exist in auth.users.
-- WHAT IT DOES NOT DO: create users, ask for or store passwords, or use any
--   service-role/secret key. Passwords are typed into the Supabase dashboard.
--
-- It needs the 001 migration (set_admin_role) to have been applied.

do $$
declare
  target_email text;
  target_id    uuid;
begin
  if to_regprocedure('public.set_admin_role(uuid)') is null then
    raise exception 'public.set_admin_role(uuid) not found. Run supabase/migrations/001_admin_cms.sql first.';
  end if;

  foreach target_email in array array[
    'you@example.com',   -- admin #1
    'you@example.com'    -- admin #2 - replace both addresses
  ]
  loop
    -- Case-insensitive lookup, so "You@Example.com" also resolves.
    select u.id
      into target_id
      from auth.users u
     where lower(u.email) = lower(btrim(target_email))
     limit 1;

    if target_id is null then
      -- RAISE takes one plain string literal (the message) then optional
      -- format args; concatenating with || is a syntax error, so the whole
      -- sentence must be a single literal containing the % placeholder.
      raise exception
        'MAKE-ADMIN STOPPED: no auth.users row for "%" (checked case-insensitively). Create it first: Authentication > Users > Add user, "Auto Confirm User" checked. Nothing was changed - create the user, then run this file again.',
        target_email;
    end if;

    perform public.set_admin_role(target_id);

    raise notice 'OK: app_metadata.role = admin for % (user id %)', target_email, target_id;
  end loop;
end
$$;

-- Confirm: every account that now carries the admin role.
select
  u.email,
  coalesce(u.raw_app_meta_data ->> 'role', '<no role>') as app_metadata_role,
  case when coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin'
       then 'yes' else 'NO' end                          as is_admin
from auth.users u
where coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin'
order by u.email;
