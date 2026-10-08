import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n";
import { getPosts, renderBody } from "@/insights";

export function generateStaticParams() {
  return getPosts().flatMap((p) => [{ locale: "en", slug: p.slug }, { locale: "ar", slug: p.slug }]);
}

export default function PostPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const post = getPosts().find((p) => p.slug === params.slug);
  if (!post) notFound();
  return (
    <article className="mx-auto w-full max-w-3xl px-5 pt-12 pb-16 sm:px-8">
      <p className="eyebrow">— {post.date}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{params.locale === "ar" ? post.title_ar : post.title_en}</h1>
      <div className="mt-6 space-y-4 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:ps-6" dangerouslySetInnerHTML={{ __html: renderBody(post.body) }} />
      <Link href={`/${params.locale}/insights`} className="btn-secondary mt-8">← {params.locale === "ar" ? "كل المقالات" : "All posts"}</Link>
    </article>
  );
}
