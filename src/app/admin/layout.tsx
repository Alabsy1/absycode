import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, getMissingEnvError } from "@/lib/supabase/env";
import { isAdminIdentity } from "@/lib/admin-policy";
import AdminSidebar from "./Sidebar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * `/admin` lives OUTSIDE the `[locale]` segment just like `/login`, so it is
 * not wrapped by `src/app/[locale]/layout.tsx` and must supply its own
 * `<html>`/`<body>`. The root layout cannot do it (it receives `params = {}`
 * and would nest a second document inside the locale layout's). See
 * `src/app/login/layout.tsx` for the full root-cause write-up.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv) {
    return (
      <html lang="en" dir="ltr" style={{ colorScheme: "light" }} suppressHydrationWarning>
        <head>
          <meta name="color-scheme" content="light" />
        </head>
        <body className="min-h-screen antialiased bg-[#FAF3EC] text-[#382216]" style={{ colorScheme: "light" }} suppressHydrationWarning>
          <div className="flex min-h-screen items-center justify-center bg-[#FAF3EC] px-5">
            <div className="card max-w-md p-7">
              <h1 className="text-2xl font-bold tracking-tight">Setup required</h1>
              <p className="mt-3 text-sm text-[#7A6A5F]">{getMissingEnvError()}</p>
              <p className="mt-4 text-sm text-[#7A6A5F]">See the README admin section for the env keys and SQL migration.</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user || !isAdminIdentity(user.app_metadata)) {
    redirect("/login?next=/admin");
  }

  return (
    <html lang="en" dir="ltr" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen antialiased bg-[#FAF3EC] text-[#382216]" style={{ colorScheme: "light" }} suppressHydrationWarning>
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col bg-[#FAF3EC] md:flex-row">
          <AdminSidebar email={(user.email ?? "").toLowerCase()} />
          <div className="flex-1 px-5 py-8 md:px-10">
            {!user.email_confirmed_at && (
              <p className="mb-6 rounded-lg border border-[#B5622F]/40 bg-[#B5622F]/10 px-4 py-3 text-sm text-[#382216]">
                Your email is not confirmed yet — confirm the verification email to complete setup.
              </p>
            )}
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}