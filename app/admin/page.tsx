"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Article = {
  id: number;
  title: string | null;
  excerpt?: string | null;
  category: string | null;
  author: string | null;
  created_at: string | null;
  status: string | null;
  slug: string | null;
  image_url?: string | null;
};

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  /* ================= LOAD ARTICLES ================= */

  async function loadArticles(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Could not load articles:", error);

      alert("Could not load articles: " + error.message);

      setArticles([]);
      setLoading(false);
      return;
    }

    setArticles((data || []) as Article[]);
    setLoading(false);
  }

  /* ================= DELETE ARTICLE ================= */

  async function deleteArticle(article: Article) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete:\n\n"${
        article.title || "Untitled Article"
      }"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(article.id);

    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", article.id);

      if (error) {
        throw new Error(
          "Could not delete article: " + error.message
        );
      }

      setArticles((currentArticles) =>
        currentArticles.filter(
          (item) => item.id !== article.id
        )
      );

      alert("Article deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the article."
      );

      await loadArticles(false);
    } finally {
      setDeletingId(null);
    }
  }

  /* ================= PUBLISH / UNPUBLISH ================= */

  async function toggleArticleStatus(article: Article) {
    const isPublished = article.status === "published";

    const newStatus = isPublished
      ? "draft"
      : "published";

    const actionText = isPublished
      ? "unpublish"
      : "publish";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText}:\n\n"${
        article.title || "Untitled Article"
      }"?`
    );

    if (!confirmed) return;

    setUpdatingStatusId(article.id);

    try {
      const { error } = await supabase
        .from("articles")
        .update({
          status: newStatus,
        })
        .eq("id", article.id);

      if (error) {
        throw new Error(
          `Could not ${actionText} article: ${error.message}`
        );
      }

      /* Update dashboard immediately */

      setArticles((currentArticles) =>
        currentArticles.map((item) =>
          item.id === article.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      alert(
        isPublished
          ? "Article moved back to draft!"
          : "🎉 Article published successfully!"
      );
    } catch (error) {
      console.error("Status update error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the article."
      );

      await loadArticles(false);
    } finally {
      setUpdatingStatusId(null);
    }
  }

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    loadArticles();
  }, []);

  /* ================= STATISTICS ================= */

  const published = useMemo(() => {
    return articles.filter(
      (article) => article.status === "published"
    ).length;
  }, [articles]);

  const drafts = useMemo(() => {
    return articles.filter(
      (article) => article.status === "draft"
    ).length;
  }, [articles]);

  const categories = useMemo(() => {
    return new Set(
      articles
        .map((article) => article.category)
        .filter(Boolean)
    ).size;
  }, [articles]);

  /* ================= CATEGORY LIST ================= */

  const categoryList = useMemo(() => {
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
        article.status,
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

      const matchesStatus =
        selectedStatus === "all" ||
        article.status === selectedStatus;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    articles,
    search,
    selectedCategory,
    selectedStatus,
  ]);

  /* ================= HELPERS ================= */

  function formatDate(date?: string | null) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getInitials(text?: string | null) {
    if (!text) return "A";

    return (
      text
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "A"
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-white">
  G
</div>

            <div>
              <p className="font-black tracking-tight">
                GLOBALYN
              </p>

              <p className="text-xs text-slate-400">
                Admin Studio
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">

            <Link
              href="/"
              className="hover:text-slate-950"
            >
              Home
            </Link>

            <Link
              href="/blog"
              className="hover:text-slate-950"
            >
              Articles
            </Link>

            <Link
              href="/admin"
              className="text-slate-950"
            >
              Admin
            </Link>

          </nav>

          <Link
            href="/admin/new"
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            + New Article
          </Link>

        </div>

      </header>

      {/* ================= HERO ================= */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            Content Management
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Your publishing dashboard.
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
                Create, manage and publish your stories from one
                beautiful workspace.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => loadArticles()}
                disabled={loading}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "🔄 Refresh"}
              </button>

              <Link
                href="/"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold hover:bg-slate-50"
              >
                View Website →
              </Link>

              <Link
                href="/admin/new"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
              >
                Create Article +
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* ================= DASHBOARD ================= */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">

        {/* ================= STATISTICS ================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              All
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Total Articles
            </p>

            <p className="mt-5 text-4xl font-black">
              {articles.length}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-xs font-black uppercase tracking-wider text-emerald-500">
              Live
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Published
            </p>

            <p className="mt-5 text-4xl font-black">
              {published}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-xs font-black uppercase tracking-wider text-amber-500">
              Draft
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Draft Articles
            </p>

            <p className="mt-5 text-4xl font-black">
              {drafts}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-xs font-black uppercase tracking-wider text-purple-500">
              Topics
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Categories
            </p>

            <p className="mt-5 text-4xl font-black">
              {categories}
            </p>

          </div>

        </div>

        {/* ================= CONTENT LIBRARY ================= */}

        <div className="mt-14">

          <div>

            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
              Content Library
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Manage your stories.
            </h2>

            <p className="mt-2 text-slate-500">
              Search, filter, edit, publish or remove your articles.
            </p>

          </div>

          {/* ================= FILTERS ================= */}

          <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-[1fr_220px_180px_auto]">

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

            </div>

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none"
            >
              <option value="all">
                All Categories
              </option>

              {categoryList.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}

            </select>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none"
            >
              <option value="all">
                All Status
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>

            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:bg-slate-50"
            >
              Clear
            </button>

          </div>

          {/* RESULTS */}

          <p className="mt-5 text-sm font-semibold text-slate-500">
            Showing{" "}
            <span className="font-black text-slate-900">
              {filteredArticles.length}
            </span>{" "}
            of{" "}
            <span className="font-black text-slate-900">
              {articles.length}
            </span>{" "}
            articles
          </p>

          {/* ================= LOADING ================= */}

          {loading ? (

            <div className="mt-8 space-y-4">

              {[1, 2, 3, 4].map((item) => (

                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="h-4 w-32 rounded bg-slate-200" />

                  <div className="mt-4 h-7 w-2/3 rounded bg-slate-200" />

                  <div className="mt-4 h-4 w-48 rounded bg-slate-200" />
                </div>

              ))}

            </div>

          ) : filteredArticles.length === 0 ? (

            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

              <div className="text-5xl">
                📝
              </div>

              <h3 className="mt-5 text-2xl font-black">
                No articles found
              </h3>

              <p className="mt-3 text-slate-500">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full border border-slate-200 px-6 py-3 text-sm font-bold hover:bg-slate-50"
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="mt-8 space-y-4">

              {filteredArticles.map((article) => {

                const isPublished =
                  article.status === "published";

                const isUpdating =
                  updatingStatusId === article.id;

                const isDeleting =
                  deletingId === article.id;

                return (

                  <article
                    key={article.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* ARTICLE INFORMATION */}

                      <div className="flex min-w-0 items-start gap-4">

                        {article.image_url ? (

                          <img
                            src={article.image_url}
                            alt={article.title || "Article image"}
                            className="h-20 w-28 shrink-0 rounded-xl object-cover"
                          />

                        ) : (

                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-white">
                            {getInitials(article.title)}
                          </div>

                        )}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              {article.category || "Uncategorized"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                isPublished
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {isPublished
                                ? "Published"
                                : "Draft"}
                            </span>

                          </div>

                          <h3 className="mt-3 truncate text-lg font-black text-slate-950 sm:text-xl">
                            {article.title || "Untitled Article"}
                          </h3>

                          {article.excerpt && (

                            <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-500">
                              {article.excerpt}
                            </p>

                          )}

                          <p className="mt-3 text-sm text-slate-500">

                            By{" "}

                            <span className="font-semibold text-slate-700">
                              {article.author || "Anonymous"}
                            </span>

                            {" • "}

                            {formatDate(article.created_at)}

                          </p>

                        </div>

                      </div>

                      {/* ================= ACTIONS ================= */}

                      <div className="flex flex-wrap items-center gap-2">

                        {/* VIEW */}

                        {article.slug && isPublished && (

                          <Link
                            href={`/blog/${article.slug}`}
                            target="_blank"
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50"
                          >
                            👁 View
                          </Link>

                        )}

                        {/* PUBLISH / UNPUBLISH */}

                        <button
                          type="button"
                          onClick={() =>
                            toggleArticleStatus(article)
                          }
                          disabled={isUpdating || isDeleting}
                          className={`rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isPublished
                              ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {isUpdating
                            ? "Updating..."
                            : isPublished
                            ? "↩ Unpublish"
                            : "🚀 Publish"}
                        </button>

                        {/* EDIT */}

                        <Link
                          href={`/admin/edit/${article.id}`}
                          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50"
                        >
                          ✎ Edit
                        </Link>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            deleteArticle(article)
                          }
                          disabled={isDeleting || isUpdating}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "🗑 Delete"}
                        </button>

                      </div>

                    </div>

                  </article>

                );
              })}

            </div>

          )}

        </div>

        {/* ================= CREATE CTA ================= */}

        <div className="mt-14 rounded-3xl bg-slate-950 px-7 py-10 text-white sm:px-10 sm:py-12">

          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Ready to create?
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <h2 className="text-3xl font-black">
                Share your next big idea.
              </h2>

              <p className="mt-3 max-w-xl text-slate-400">
                Create a new story and publish your ideas for the
                world to explore.
              </p>

            </div>

            <Link
              href="/admin/new"
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
            >
              + Write New Article
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}