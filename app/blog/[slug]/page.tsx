import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

const siteUrl = "https://globalyn.vercel.app";

type Article = {
id: number;
title: string | null;
slug: string | null;
excerpt: string | null;
category: string | null;
author: string | null;
content: string | null;
image_url: string | null;
status: string | null;
created_at?: string | null;
};

type BlogArticlePageProps = {
params: Promise<{
slug: string;
}>;
};

async function getArticle(slug: string) {
const { data, error } = await supabase
.from("articles")
.select("*")
.eq("slug", slug)
.eq("status", "published")
.single();

if (error || !data) {
return null;
}

return data as Article;
}

export async function generateMetadata({
params,
}: BlogArticlePageProps): Promise<Metadata> {
const { slug } = await params;
const article = await getArticle(slug);

if (!article) {
return {
title: "Article Not Found",
description: "The article you are looking for could not be found.",
};
}

const title =
article.title || "Latest News, Business & Innovation";

const description =
article.excerpt ||
"Discover the latest news, business insights, technology trends and innovation stories from Globalyn.";

const articleUrl = `${siteUrl}/blog/${article.slug}`;

return {
title,
description,

alternates: {
  canonical: articleUrl,
},

authors: article.author
  ? [
      {
        name: article.author,
      },
    ]
  : undefined,

openGraph: {
  title,
  description,
  url: articleUrl,
  siteName: "Globalyn",
  type: "article",
  locale: "en_US",

  publishedTime: article.created_at || undefined,

  authors: article.author
    ? [article.author]
    : undefined,

  section: article.category || undefined,

  images: article.image_url
    ? [
        {
          url: article.image_url,
          width: 1200,
          height: 630,
          alt: article.title || "Globalyn article",
        },
      ]
    : undefined,
},

twitter: {
  card: article.image_url
    ? "summary_large_image"
    : "summary",

  title,
  description,

  images: article.image_url
    ? [article.image_url]
    : undefined,
},

robots: {
  index: true,
  follow: true,
},

};
}

export default async function BlogArticlePage({
params,
}: BlogArticlePageProps) {
const { slug } = await params;

const article = await getArticle(slug);

if (!article) {
notFound();
}

const plainText = (article.content || "")
.replace(/<[^>]*>/g, " ")
.replace(/ /g, " ")
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/\s+/g, " ")
.trim();

const wordCount = plainText
? plainText.split(" ").filter(Boolean).length
: 0;

const readTime = Math.max(
1,
Math.ceil(wordCount / 220)
);

return (
<main className="min-h-screen bg-white text-slate-900">
{/* HEADER */}
<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
<div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
<Link href="/" className="flex items-center gap-3" >
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-lg font-black text-white shadow-lg">
G
</div>

        <div>
          <p className="font-black tracking-tight text-slate-950">
            GLOBALYN
          </p>

          <p className="text-xs text-slate-400">
            Technology • Innovation • Business
          </p>
        </div>
      </Link>

      <Link
        href="/"
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        ← Home
      </Link>
    </div>
  </header>

  {/* ARTICLE HERO */}
  <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-20">
      {article.category && (
        <div className="mb-6">
          <span className="inline-flex rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
            {article.category}
          </span>
        </div>
      )}

      <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
          {article.excerpt}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-slate-500">
        {article.author && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 font-black text-purple-700">
              {article.author.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Written by
              </p>

              <p className="font-bold text-slate-900">
                {article.author}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span>📖</span>
          <span>{readTime} min read</span>
        </div>

        <div className="flex items-center gap-2">
          <span>📝</span>
          <span>{wordCount} words</span>
        </div>
      </div>
    </div>
  </section>

  {/* FEATURED IMAGE */}
  {article.image_url && (
    <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
      <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-xl shadow-slate-200/50">
        <img
          src={article.image_url}
          alt={article.title || "Article image"}
          className="h-auto w-full object-cover"
        />
      </div>
    </section>
  )}

  {/* ARTICLE CONTENT */}
  <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
    <div
      className="article-content text-lg leading-8 text-slate-700 [&_p]:mb-6 [&_h1]:mb-6 [&_h1]:mt-12 [&_h1]:text-4xl [&_h1]:font-black [&_h1]:leading-tight [&_h1]:text-slate-950 [&_h2]:mb-5 [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-slate-950 [&_h3]:mb-4 [&_h3]:mt-9 [&_h3]:text-2xl [&_h3]:font-black [&_h3]:leading-tight [&_h3]:text-slate-900 [&_strong]:font-bold [&_em]:italic [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-7 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-7 [&_li]:pl-1 [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-purple-600 [&_blockquote]:bg-purple-50 [&_blockquote]:px-6 [&_blockquote]:py-5 [&_blockquote]:text-xl [&_blockquote]:font-medium [&_blockquote]:italic [&_blockquote]:leading-8 [&_blockquote]:text-slate-800 [&_a]:font-semibold [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-purple-700 [&_mark]:rounded [&_mark]:px-1 [&_span]:transition-colors"
      dangerouslySetInnerHTML={{
        __html: article.content || "",
      }}
    />
  </article>

  {/* THANK YOU SECTION */}
  <section className="border-t border-slate-200 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <div className="rounded-3xl border border-white bg-white p-8 text-center shadow-xl shadow-purple-100/50">
        <p className="text-sm font-bold uppercase tracking-widest text-purple-500">
          Thanks for reading
        </p>

        <h2 className="mt-3 text-2xl font-black text-slate-950">
          Discover more stories and insights.
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Explore the latest stories about technology,
          innovation, business and the ideas shaping tomorrow.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-7 py-3.5 font-bold text-white shadow-lg transition hover:scale-[1.03]"
        >
          ← Back to Articles
        </Link>
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto max-w-7xl px-5 py-8 text-center text-sm text-slate-400 sm:px-8">
      © {new Date().getFullYear()} GLOBALYN. All rights reserved.
    </div>
  </footer>
</main>

);
}