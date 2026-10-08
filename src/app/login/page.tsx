import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { safeNext } from "@/lib/open-redirect";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin login · AbsyCode",
  robots: { index: false, follow: false },
};

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = safeNext(searchParams.next, "/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF3EC] px-5 py-16">
      {/* translate="no": Google/Edge translate rewrites text nodes in place; this
          container is the login form, so keep reconciliation and the error copy
          under React's control instead of a machine-translated tree. */}
      <div className="w-full max-w-md" translate="no">
        <div className="flex flex-col items-center text-center">
          <Logo className="h-10 w-10" />
          <p className="eyebrow mt-4">— AbsyCode admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Sign in</h1>
        </div>
        <LoginForm next={next} />
        <p className="mt-8 text-center text-sm text-[#7A6A5F]">
          <Link href="/en" className="underline underline-offset-4 hover:text-[#B5622F]">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}