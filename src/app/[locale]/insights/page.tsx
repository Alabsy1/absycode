import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n";
import { getPosts } from "@/insights";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default function Insights({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const posts = getPosts();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-16 sm:px-8">
      <p className="eyebrow">— {params.locale === "ar" ? "المدونة" : "Insights"}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{params.locale === "ar" ? "مقالات وأفكار" : "Notes on building"}</h1>
      <ul className="mt-8 space-y-4">
        {posts.map((p) => (
          <li key={p.slug} className="card p-5">
            <p className="font-mono text-xs text-[#7A6A5F]">{p.date}</p>
            <Link href={`/${params.locale}/insights/${p.slug}`} className="mt-1 block text-xl font-bold hover:text-[#B5622F]">
              {params.locale === "ar" ? p.title_ar : p.title_en}
            </Link>
            <p className="mt-1 text-sm text-[#7A6A5F]">{params.locale === "ar" ? p.excerpt_ar : p.excerpt_en}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
