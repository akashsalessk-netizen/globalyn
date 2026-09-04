"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Article } from "./page";

type BlogClientProps = {
articles: Article[];
};

function formatDate(date: string | null | undefined) {
if (!date) return "Recently";

return new Intl.DateTimeFormat("en-US", {
day: "numeric",
month: "short",
year: "numeric",
}).format(new Date(date));
}

function getReadingTime(content: string | null | undefined) {
const plainText = (content || "")
.replace(/<[^>]*>/g, " ")
.replace(/ /g, " ")
.replace(/\s+/g, " ")
.trim();

const wordCount = plainText
? plainText.split(" ").length
: 0;

return Math.max(1, Math.ceil(wordCount / 220));
}

function getInitials(name: string | null | undefined) {
return (name || "MY BLOG")
.split(" ")
.filter(Boolean)
.map((word: string) => word.charAt(0))
.join("")
.slice(0, 2)
.toUpperCase();
}

export default function BlogClient({
articles,
}: BlogClientProps) {
const [search, setSearch] = useState("");
const [selectedCategory, setSelectedCategory] =
useState("all");

const categories = useMemo(() => {
return Array.from(
new Set(
articles
.map((article) => article.category)
.filter(
(category): category is string =>
Boolean(category)
)
)
).sort();
}, [articles]);

const filteredArticles = useMemo(() => {
const searchText = search.trim().toLowerCase();

return articles.filter((article) => {
  const searchableText = [
    article.title,
    article.excerpt,
    article.category,
    article.author,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchesSearch =
    !searchText ||
    searchableText.includes(searchText);

  const matchesCategory =
    selectedCategory === "all" ||
    article.category === selectedCategory;

  return matchesSearch && matchesCategory;
});

}, [
articles,
search,
selectedCategory,
]);

const featuredArticle =
filteredArticles.length > 0
? filteredArticles[0]
: null;

function clearFilters() {
setSearch("");
setSelectedCategory("all");
}

return (
<main className="min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">

  {/* BACKGROUND */}
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-violet-300/20 blur-[150px]" />

    <div className="absolute -right-48 top-[350px] h-[550px] w-[550px] rounded-full bg-sky-300/20 blur-[150px]" />

    <div className="absolute bottom-[-250px] left-[30%] h-[550px] w-[550px] rounded-full bg-pink-200/20 blur-[160px]" />
  </div>

  {/* HEADER */}
  <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

      <Link
        href="/"
        className="group flex items-center gap-3"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 text-lg font-black text-white shadow-lg shadow-indigo-500/20">
          G
        </div>

        <div>
          <p className="text-lg font-black tracking-tight text-slate-950">
            GLOBALYN
          </p>

          <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
            Technology • Innovation • Business
          </p>
        </div>
      </Link>

      <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex">
        <Link
          href="/"
          className="transition hover:text-slate-950"
        >
          Home
        </Link>

        <Link
          href="/blog"
          className="text-slate-950"
        >
          Articles
        </Link>
      </nav>

      <Link
        href="/"
        className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:text-violet-600"
      >
        ← Home
      </Link>
    </div>
  </header>

  {/* HERO */}
  <section>
    <div className="mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
      <div className="max-w-4xl">

        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-violet-600 shadow-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
          Latest Stories
        </div>

        <h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
          Ideas worth

          <span className="block bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            reading.
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-500 sm:text-xl">
          Explore stories, insights and ideas about
          technology, innovation, business and the future.
        </p>

      </div>
    </div>
  </section>

  {/* SEARCH AND FILTERS */}
  <section className="mx-auto max-w-7xl px-5 sm:px-8">
    <div className="rounded-[2rem] border border-white bg-white p-6 shadow-xl shadow-slate-900/[0.05] sm:p-8">

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
            🔍
          </span>

          <input
            type="search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search articles..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 text-sm font-medium outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-slate-200 px-6 py-4 text-sm font-bold transition hover:bg-slate-50"
        >
          Clear Filters
        </button>

      </div>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() =>
              setSelectedCategory("all")
            }
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              selectedCategory === "all"
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600"
            }`}
          >
            All Articles
          </button>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                selectedCategory === category
                  ? "bg-violet-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {category}
            </button>
          ))}

        </div>
      )}

    </div>
  </section>

  {/* RESULTS */}
  <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8">

    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
          Explore
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Latest articles
        </h2>
      </div>

      <p className="text-sm font-semibold text-slate-400">
        Showing{" "}
        <span className="font-black text-slate-700">
          {filteredArticles.length}
        </span>{" "}
        of{" "}
        <span className="font-black text-slate-700">
          {articles.length}
        </span>{" "}
        articles
      </p>
    </div>

    {/* NO RESULTS */}
    {filteredArticles.length === 0 ? (

      <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

        <div className="text-5xl">
          🔎
        </div>

        <h3 className="mt-6 text-2xl font-black">
          No articles found
        </h3>

        <p className="mt-3 text-slate-500">
          Try another search or category.
        </p>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-7 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white hover:bg-violet-600"
        >
          Clear Filters
        </button>

      </div>

    ) : (

      <>
        {/* FEATURED ARTICLE */}
        {featuredArticle && (

          <Link
            href={`/blog/${featuredArticle.slug || ""}`}
            className="group mt-10 block overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-slate-900/[0.08] transition duration-300 hover:-translate-y-1 hover:shadow-slate-900/[0.15]"
          >

            <div className="grid lg:grid-cols-[1.1fr_1fr]">

              <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 lg:min-h-[520px]">

                {featuredArticle.image_url ? (

                  <img
                    src={featuredArticle.image_url}
                    alt={featuredArticle.title || "Featured article"}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                ) : (

                  <div className="flex h-full min-h-[320px] items-center justify-center lg:min-h-[520px]">

                    <span className="text-8xl font-black text-white">

                      {(featuredArticle.title || "Globalyn")
                        .split(" ")
                        .slice(0, 2)
                        .map((word: string) =>
                          word.charAt(0)
                        )
                        .join("")
                        .toUpperCase()}

                    </span>

                  </div>

                )}

              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">

                <span className="text-xs font-black uppercase tracking-[0.15em] text-violet-600">
                  Featured Story
                </span>

                <h2 className="mt-5 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                  {featuredArticle.title || "Untitled Article"}
                </h2>

                {featuredArticle.excerpt && (
                  <p className="mt-5 text-lg leading-8 text-slate-500">
                    {featuredArticle.excerpt}
                  </p>
                )}

                <div className="mt-7 flex gap-4 text-sm font-semibold text-slate-400">

                  <span>
                    {formatDate(featuredArticle.created_at)}
                  </span>

                  <span>•</span>

                  <span>
                    {getReadingTime(
                      featuredArticle.content
                    )} min read
                  </span>

                </div>

                <div className="mt-8 font-black text-violet-600">
                  Read article →
                </div>

              </div>

            </div>

          </Link>

        )}

        {/* ARTICLE GRID */}
        <div className="mt-10 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">

          {filteredArticles.slice(1).map((article) => {

            const authorName =
              article.author?.trim() || "GLOBALYN";

            const initials =
              getInitials(authorName);

            const articleTitle =
              article.title || "Untitled Article";

            return (

              <Link
                key={article.id}
                href={`/blog/${article.slug || ""}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-lg shadow-slate-900/[0.04] transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >

                <div className="relative h-60 overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500">

                  {article.image_url ? (

                    <img
                      src={article.image_url}
                      alt={articleTitle}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                  ) : (

                    <div className="flex h-full items-center justify-center">

                      <span className="text-6xl font-black text-white">

                        {articleTitle
                          .split(" ")
                          .slice(0, 2)
                          .map((word: string) =>
                            word.charAt(0)
                          )
                          .join("")
                          .toUpperCase()}

                      </span>

                    </div>

                  )}

                  <div className="absolute left-5 top-5">
                    <span className="rounded-full bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-800">
                      {article.category || "Technology"}
                    </span>
                  </div>

                </div>

                <div className="flex flex-1 flex-col p-6">

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">

                    <span>
                      {formatDate(article.created_at)}
                    </span>

                    <span>•</span>

                    <span>
                      {getReadingTime(
                        article.content
                      )} min read
                    </span>

                  </div>

                  <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950 transition group-hover:text-violet-600">
                    {articleTitle}
                  </h3>

                  {article.excerpt && (
                    <p className="mt-4 line-clamp-3 leading-7 text-slate-500">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-4 pt-7">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-black text-white">
                        {initials}
                      </div>

                      <span className="text-sm font-bold text-slate-600">
                        {authorName}
                      </span>

                    </div>

                    <span className="text-lg font-black text-violet-600">
                      →
                    </span>

                  </div>

                </div>

              </Link>

            );
          })}

        </div>

      </>

    )}

  </section>

  {/* FOOTER */}
  <footer className="border-t border-slate-200 bg-white/70">

    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">

      <p className="text-sm font-semibold text-slate-400">
        © {new Date().getFullYear()} GLOBALYN.
        All rights reserved.
      </p>

      <div className="flex items-center gap-6 text-sm font-bold text-slate-500">

        <Link href="/">
          Home
        </Link>

        <Link href="/blog">
          Articles
        </Link>

      </div>

    </div>

  </footer>

</main>

);
}