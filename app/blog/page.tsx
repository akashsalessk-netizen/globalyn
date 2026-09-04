"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Article = {
  id: number;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  category: string | null;
  author: string | null;
  content: string | null;
  image_url: string | null;
  status: string | null;
  created_at: string | null;
};

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  /* ================= LOAD ARTICLES ================= */

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        setArticles((data || []) as Article[]);
      } catch (error) {
        console.error("Could not load blog articles:", error);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  /* ================= CATEGORY LIST ================= */

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

  /* ================= FILTER ARTICLES ================= */

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
  }, [articles, search, selectedCategory]);

  /* ================= FEATURED ARTICLE ================= */

  const featuredArticle = articles[0] || null;

  /* ================= HELPERS ================= */

  function formatDate(date?: string | null) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function getReadingTime(content?: string | null) {
    if (!content) return 1;

    const plainText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

    const words = plainText
      ? plainText.split(" ").filter(Boolean).length
      : 0;

    return Math.max(1, Math.ceil(words / 220));
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <Link href="/" className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-white shadow-lg">
              M
            </div>

            <div>
              <p className="font-black tracking-tight text-slate-950">
                MY BLOG
              </p>

              <p className="text-xs text-slate-400">
                Stories & Ideas
              </p>
            </div>

          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 md:flex">

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

            <Link
              href="/admin"
              className="transition hover:text-slate-950"
            >
              Admin
            </Link>

          </nav>

          <Link
            href="/admin/new"
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            + Write
          </Link>

        </div>

      </header>

      {/* ================= HERO ================= */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
            The Blog
          </p>

          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Ideas worth
            <br />
            reading.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500 sm:text-xl">
            Explore stories, insights, technology, business,
            innovation and the ideas shaping our world.
          </p>

        </div>

      </section>

      {/* ================= FEATURED ARTICLE ================= */}

      {!loading && featuredArticle && (
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

          <div className="mb-7 flex items-center justify-between">

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                Latest Story
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Featured article.
              </h2>
            </div>

          </div>

          <Link
            href={`/blog/${featuredArticle.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-2"
          >

            {/* IMAGE */}

            <div className="relative min-h-[280px] overflow-hidden bg-slate-200 sm:min-h-[420px]">

              {featuredArticle.image_url ? (

                <img
                  src={featuredArticle.image_url}
                  alt={featuredArticle.title || "Featured article"}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

              ) : (

                <div className="flex h-full min-h-[280px] items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-7xl font-black text-white sm:min-h-[420px]">
                  {featuredArticle.title?.charAt(0) || "M"}
                </div>

              )}

            </div>

            {/* CONTENT */}

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">

              <div className="flex flex-wrap items-center gap-3">

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                  {featuredArticle.category || "General"}
                </span>

                <span className="text-sm font-semibold text-slate-400">
                  {getReadingTime(featuredArticle.content)} min read
                </span>

              </div>

              <h3 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {featuredArticle.title || "Untitled Article"}
              </h3>

              {featuredArticle.excerpt && (

                <p className="mt-5 text-lg leading-8 text-slate-500">
                  {featuredArticle.excerpt}
                </p>

              )}

              <div className="mt-8 flex items-center justify-between gap-4">

                <div>

                  <p className="font-bold text-slate-800">
                    {featuredArticle.author || "MY BLOG"}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatDate(featuredArticle.created_at)}
                  </p>

                </div>

                <span className="text-sm font-black text-slate-950 transition group-hover:translate-x-1">
                  Read Article →
                </span>

              </div>

            </div>

          </Link>

        </section>
      )}

      {/* ================= ARTICLES ================= */}

      <section className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                Explore
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                Latest articles.
              </h2>

              <p className="mt-4 text-slate-500">
                Discover stories from our latest collection.
              </p>

            </div>

            {/* SEARCH */}

            <div className="w-full lg:max-w-md">

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-11 pr-5 text-sm font-medium outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />

              </div>

            </div>

          </div>

          {/* ================= CATEGORY FILTER ================= */}

          {!loading && categories.length > 0 && (

            <div className="mt-10 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  selectedCategory === "all"
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
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
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {category}
                </button>

              ))}

            </div>

          )}

          {/* ================= ARTICLE GRID ================= */}

          {loading ? (

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3, 4, 5, 6].map((item) => (

                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >

                  <div className="h-52 bg-slate-200" />

                  <div className="space-y-4 p-6">

                    <div className="h-4 w-24 rounded bg-slate-200" />

                    <div className="h-7 w-full rounded bg-slate-200" />

                    <div className="h-7 w-2/3 rounded bg-slate-200" />

                    <div className="h-4 w-full rounded bg-slate-200" />

                  </div>

                </div>

              ))}

            </div>

          ) : filteredArticles.length === 0 ? (

            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center">

              <div className="text-5xl">
                🔍
              </div>

              <h3 className="mt-5 text-2xl font-black">
                No articles found
              </h3>

              <p className="mt-3 text-slate-500">
                Try searching for something else or choose another category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
                className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">

              {filteredArticles.map((article) => (

                <article
                  key={article.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <Link href={`/blog/${article.slug}`}>

                    {/* IMAGE */}

                    <div className="relative h-52 overflow-hidden bg-slate-200">

                      {article.image_url ? (

                        <img
                          src={article.image_url}
                          alt={article.title || "Article image"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 to-slate-700 text-5xl font-black text-white">
                          {article.title?.charAt(0) || "M"}
                        </div>

                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="p-6">

                      <div className="flex items-center justify-between gap-3">

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {article.category || "General"}
                        </span>

                        <span className="text-xs font-semibold text-slate-400">
                          {getReadingTime(article.content)} min
                        </span>

                      </div>

                      <h3 className="mt-5 text-xl font-black leading-snug tracking-tight text-slate-950 transition group-hover:text-slate-600">
                        {article.title || "Untitled Article"}
                      </h3>

                      {article.excerpt && (

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                          {article.excerpt}
                        </p>

                      )}

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

                        <div>

                          <p className="text-sm font-bold text-slate-700">
                            {article.author || "MY BLOG"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(article.created_at)}
                          </p>

                        </div>

                        <span className="text-sm font-black text-slate-950">
                          →
                        </span>

                      </div>

                    </div>

                  </Link>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

      {/* ================= NEWSLETTER CTA ================= */}

      <section className="bg-slate-950">

        <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
            Stay Curious
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            Great ideas deserve
            <br />
            great readers.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-400">
            Discover new stories, ideas and insights from the world
            of business, technology and innovation.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-200"
          >
            Explore More →
          </Link>

        </div>

      </section>

    </main>
  );
}