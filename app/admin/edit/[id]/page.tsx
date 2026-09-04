"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
};

const CATEGORIES = [
  "Artificial Intelligence (AI)",
  "Business",
  "Innovation",
  "Sports",
  "Startups",
  "Technology",
];

const TEXT_COLORS = [
  "#0f172a",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0f766e",
  "#0f766e",
  "#0891b2",
  "#2563eb",
  "#4338ca",
  "#7e22ce",
  "#db2777",
  "#e11d48",
  "#64748b",
];

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const editorRef = useRef<HTMLDivElement>(null);

  const idParam = params.id;

  const articleId = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] =
    useState("Technology");

  const [author, setAuthor] = useState("");

  const [content, setContent] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [status, setStatus] =
    useState<"draft" | "published">("draft");

  /* ===============================
     GENERATE SLUG
  =============================== */

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* ===============================
     HTML TO PLAIN TEXT
  =============================== */

  function htmlToPlainText(html: string) {
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, " ");
    }

    const temporaryElement =
      document.createElement("div");

    temporaryElement.innerHTML = html;

    return temporaryElement.textContent || "";
  }

  /* ===============================
     LOAD ARTICLE
  =============================== */

  useEffect(() => {
    async function loadArticle() {
      if (!articleId) {
        router.push("/admin");
        return;
      }

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("id", articleId)
          .single();

        if (error) {
          throw error;
        }

        const article = data as Article;

        setTitle(article.title || "");
        setSlug(article.slug || "");
        setExcerpt(article.excerpt || "");
        setCategory(
          article.category || "Technology"
        );
        setAuthor(article.author || "");

        const articleContent =
          article.content || "";

        setContent(articleContent);

        setImageUrl(article.image_url || "");

        setStatus(
          article.status === "published"
            ? "published"
            : "draft"
        );

        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML =
              articleContent;
          }
        }, 0);
      } catch (error) {
        console.error(
          "Load article error:",
          error
        );

        alert("Could not load this article.");

        router.push("/admin");
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [articleId, router]);

  /* ===============================
     TITLE CHANGE
  =============================== */

  function handleTitleChange(value: string) {
    const currentGeneratedSlug =
      generateSlug(title);

    setTitle(value);

    if (
      !slug ||
      slug === currentGeneratedSlug
    ) {
      setSlug(generateSlug(value));
    }
  }

  /* ===============================
     EDITOR CONTENT
  =============================== */

  function handleEditorInput() {
    if (!editorRef.current) return;

    setContent(editorRef.current.innerHTML);
  }

  /* ===============================
     FORMAT TEXT
  =============================== */

  function formatText(command: string) {
    editorRef.current?.focus();

    document.execCommand(command, false);

    handleEditorInput();
  }

  function formatBlock(tag: string) {
    editorRef.current?.focus();

    document.execCommand(
      "formatBlock",
      false,
      tag
    );

    handleEditorInput();
  }

  function setTextColor(color: string) {
    editorRef.current?.focus();

    document.execCommand(
      "foreColor",
      false,
      color
    );

    handleEditorInput();
  }

  function setHighlight(color: string) {
    editorRef.current?.focus();

    document.execCommand(
      "hiliteColor",
      false,
      color
    );

    handleEditorInput();
  }

  function clearFormatting() {
    editorRef.current?.focus();

    document.execCommand(
      "removeFormat",
      false
    );

    handleEditorInput();
  }

  /* ===============================
     SAVE ARTICLE
  =============================== */

  async function saveArticle() {
    if (!articleId) {
      alert("Article ID is missing.");
      return;
    }

    if (!title.trim()) {
      alert(
        "Please enter an article title."
      );
      return;
    }

    if (!slug.trim()) {
      alert(
        "Please enter an article URL."
      );
      return;
    }

    const currentContent =
      editorRef.current?.innerHTML || content;

    const plainContent =
      htmlToPlainText(currentContent).trim();

    if (!plainContent) {
      alert(
        "Please enter article content."
      );
      return;
    }

    setSaving(true);

    try {
      const finalSlug =
        generateSlug(slug);

      const {
        data: existingArticle,
        error: slugError,
      } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", finalSlug)
        .neq("id", articleId)
        .maybeSingle();

      if (slugError) {
        throw slugError;
      }

      if (existingArticle) {
        alert(
          "This article URL is already being used."
        );
        return;
      }

      const { error } = await supabase
        .from("articles")
        .update({
          title: title.trim(),
          slug: finalSlug,
          excerpt:
            excerpt.trim() || null,
          category:
            category || null,
          author:
            author.trim() || null,
          content: currentContent,
          image_url:
            imageUrl.trim() || null,
          status,
        })
        .eq("id", articleId);

      if (error) {
        throw error;
      }

      setContent(currentContent);

      alert(
        status === "published"
          ? "Article updated and published successfully!"
          : "Article saved as a draft!"
      );

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(
        "Save article error:",
        error
      );

      alert(
        error instanceof Error
          ? `Could not save article: ${error.message}`
          : "Something went wrong while saving the article."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ===============================
     REMOVE IMAGE
  =============================== */

  function removeImage() {
    if (!imageUrl) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove the featured image?"
    );

    if (confirmed) {
      setImageUrl("");
    }
  }

  /* ===============================
     WORD COUNT
  =============================== */

  const plainText = useMemo(
    () => htmlToPlainText(content),
    [content]
  );

  const wordCount =
    plainText.trim()
      ? plainText.trim().split(/\s+/).length
      : 0;

  const readTime = Math.max(
    1,
    Math.ceil(wordCount / 220)
  );

  /* ===============================
     LOADING SCREEN
  =============================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-14 w-56 rounded-2xl bg-slate-200" />

            <div className="h-72 rounded-3xl bg-slate-200" />

            <div className="h-[600px] rounded-3xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-900">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">

          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 text-lg font-black text-white shadow-lg">
              G
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                GLOBALYN
              </p>

              <p className="hidden text-xs font-medium text-purple-500 sm:block">
                ✨ Edit Article
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">

            <Link
              href="/admin"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 sm:block"
            >
              ← Back
            </Link>

            <button
              type="button"
              onClick={saveArticle}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

      </header>

      {/* ================= HERO ================= */}

      <section className="border-b border-slate-200 bg-white/70">

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-14">

          <div className="flex flex-col gap-8">

            <div>

              <p className="inline-flex rounded-full border border-purple-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-purple-600 shadow-sm">
                ✨ Content Editor
              </p>

              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Edit your story{" "}

                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  beautifully.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
                Update your article, formatting,
                featured image and publishing settings.
              </p>

            </div>

            {/* MOBILE FRIENDLY STATS */}

            <div className="flex gap-3 sm:gap-4">

              <div className="min-w-[145px] rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">

                <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                  Words
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {wordCount}
                </p>

              </div>

              <div className="min-w-[145px] rounded-2xl border border-purple-100 bg-white px-5 py-4 shadow-sm">

                <p className="text-xs font-black uppercase tracking-wider text-purple-500">
                  Read Time
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {readTime} min
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= MAIN ================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">

          {/* ================= LEFT SIDE ================= */}

          <div className="space-y-6 sm:space-y-8">

            {/* ARTICLE INFORMATION */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 sm:p-8">

              <div className="border-b border-slate-100 pb-6">

                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">
                  Story Details
                </p>

                <h2 className="mt-3 text-2xl font-black text-slate-950">
                  Article information
                </h2>

              </div>

              {/* TITLE */}

              <div className="mt-7">

                <label className="block text-sm font-bold text-slate-800">
                  Article Title *
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    handleTitleChange(
                      e.target.value
                    )
                  }
                  placeholder="Enter your article title..."
                  className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-4 text-base font-semibold outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-lg"
                />

              </div>

              {/* URL */}

              <div className="mt-7">

                <label className="block text-sm font-bold text-slate-800">
                  🔗 Article URL *
                </label>

                <div className="mt-3 flex overflow-hidden rounded-xl border border-slate-300">

                  <span className="flex shrink-0 items-center border-r border-slate-200 bg-purple-50 px-3 text-sm font-bold text-purple-600 sm:px-4">
                    /blog/
                  </span>

                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        generateSlug(
                          e.target.value
                        )
                      )
                    }
                    placeholder="article-url"
                    className="min-w-0 flex-1 px-3 py-4 text-sm font-semibold outline-none sm:px-4"
                  />

                </div>

              </div>

              {/* EXCERPT */}

              <div className="mt-7">

                <label className="block text-sm font-bold text-slate-800">
                  ✨ Article Excerpt
                </label>

                <textarea
                  value={excerpt}
                  onChange={(e) =>
                    setExcerpt(e.target.value)
                  }
                  rows={4}
                  placeholder="Write a short summary of your article..."
                  className="mt-3 w-full resize-none rounded-xl border border-slate-300 px-4 py-4 leading-7 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />

              </div>

            </div>

            {/* ================= ARTICLE CONTENT ================= */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 sm:p-8">

              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">
                    Writing
                  </p>

                  <h2 className="mt-3 text-2xl font-black text-slate-950">
                    Article Content
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Your formatting will be preserved.
                  </p>

                </div>

                <div className="self-start rounded-xl bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700 sm:self-auto">
                  {wordCount} words
                </div>

              </div>

              {/* ================= TOOLBAR ================= */}

              <div className="mt-6 overflow-x-auto pb-2">

                <div className="flex min-w-max items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      formatText("bold")
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black hover:bg-purple-50"
                  >
                    B
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      formatText("italic")
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg italic hover:bg-purple-50"
                  >
                    I
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      formatText("underline")
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg underline hover:bg-purple-50"
                  >
                    U
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      formatBlock("H2")
                    }
                    className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-black hover:bg-purple-50"
                  >
                    H2
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      formatBlock("H3")
                    }
                    className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-black hover:bg-purple-50"
                  >
                    H3
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      formatBlock("P")
                    }
                    className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold hover:bg-purple-50"
                  >
                    ¶
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      formatText(
                        "insertUnorderedList"
                      )
                    }
                    className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold hover:bg-purple-50"
                  >
                    • List
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      formatText(
                        "insertOrderedList"
                      )
                    }
                    className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold hover:bg-purple-50"
                  >
                    1. List
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      formatText("justifyLeft")
                    }
                    className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold hover:bg-purple-50"
                  >
                    ☰
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      formatText("justifyCenter")
                    }
                    className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold hover:bg-purple-50"
                  >
                    ≡
                  </button>

                  <button
                    type="button"
                    onClick={clearFormatting}
                    className="h-11 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 hover:bg-red-100"
                  >
                    Clear
                  </button>

                </div>

              </div>

              {/* ================= TEXT COLORS ================= */}

              <div className="mt-6">

                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Text Color
                </p>

                <div className="mt-4 flex flex-wrap gap-3">

                  {TEXT_COLORS.map(
                    (color) => (

                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setTextColor(color)
                        }
                        style={{
                          backgroundColor: color,
                        }}
                        className="h-10 w-10 rounded-full border-4 border-white shadow-md ring-1 ring-slate-200 transition hover:scale-110"
                        aria-label="Change text color"
                      />

                    )
                  )}

                </div>

              </div>

              {/* ================= HIGHLIGHT ================= */}

              <div className="mt-7">

                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Highlight
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setHighlight("#fef08a")
                    }
                    className="rounded-xl bg-yellow-200 px-4 py-3 text-sm font-bold"
                  >
                    Yellow
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHighlight("#bbf7d0")
                    }
                    className="rounded-xl bg-green-200 px-4 py-3 text-sm font-bold"
                  >
                    Green
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHighlight("#bfdbfe")
                    }
                    className="rounded-xl bg-blue-200 px-4 py-3 text-sm font-bold"
                  >
                    Blue
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHighlight("#ddd6fe")
                    }
                    className="rounded-xl bg-purple-200 px-4 py-3 text-sm font-bold"
                  >
                    Purple
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHighlight("#fbcfe8")
                    }
                    className="rounded-xl bg-pink-200 px-4 py-3 text-sm font-bold"
                  >
                    Pink
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHighlight("#fed7aa")
                    }
                    className="rounded-xl bg-orange-200 px-4 py-3 text-sm font-bold"
                  >
                    Orange
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHighlight("#fecaca")
                    }
                    className="rounded-xl bg-red-200 px-4 py-3 text-sm font-bold"
                  >
                    Red
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHighlight("#a5f3fc")
                    }
                    className="rounded-xl bg-cyan-200 px-4 py-3 text-sm font-bold"
                  >
                    Cyan
                  </button>

                </div>

              </div>

              {/* ================= EDITOR ================= */}

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                data-placeholder="Write your complete article here..."
                className="article-editor mt-8 min-h-[500px] w-full rounded-2xl border border-slate-300 px-5 py-5 text-base leading-8 text-slate-700 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:min-h-[600px]"
              />

              <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs font-medium text-slate-400">

                <span>
                  {wordCount} words
                </span>

                <span>
                  {content.length} characters
                </span>

              </div>

            </div>

          </div>

          {/* ================= SIDEBAR ================= */}

          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">

            {/* PUBLISHING */}

            <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6 text-white shadow-2xl">

              <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
                🚀 Publishing
              </p>

              <h2 className="mt-3 text-xl font-black">
                Publishing Status
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Choose whether your article is
                private or publicly visible.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setStatus("draft")
                  }
                  className={`rounded-xl px-3 py-4 text-sm font-bold transition ${
                    status === "draft"
                      ? "bg-white text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-400"
                  }`}
                >
                  📝 Draft
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStatus("published")
                  }
                  className={`rounded-xl px-3 py-4 text-sm font-bold transition ${
                    status === "published"
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                      : "border border-white/10 bg-white/5 text-slate-400"
                  }`}
                >
                  🚀 Published
                </button>

              </div>

              <button
                type="button"
                onClick={saveArticle}
                disabled={saving}
                className="mt-4 w-full rounded-xl bg-white px-4 py-4 text-sm font-black text-slate-950 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Changes"}
              </button>

            </div>

            {/* SETTINGS */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">

              <h2 className="text-lg font-black">
                ⚙️ Article Settings
              </h2>

              <div className="mt-6">

                <label className="block text-sm font-bold">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                >
                  {CATEGORIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

              </div>

              <div className="mt-6">

                <label className="block text-sm font-bold">
                  ✍️ Author
                </label>

                <input
                  type="text"
                  value={author}
                  onChange={(e) =>
                    setAuthor(e.target.value)
                  }
                  placeholder="Enter author name..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />

              </div>

            </div>

            {/* FEATURED IMAGE */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">

              <h2 className="text-lg font-black">
                🖼️ Featured Image
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add or update your article image.
              </p>

              {imageUrl ? (
                <div className="mt-5">

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                    <img
                      src={imageUrl}
                      alt="Article preview"
                      className="h-52 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-600"
                  >
                    🗑 Remove Image
                  </button>

                </div>
              ) : (
                <div className="mt-5 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50 px-5 py-8 text-center">

                  <div className="text-4xl">
                    🖼️
                  </div>

                  <p className="mt-3 text-sm font-medium text-purple-500">
                    No featured image
                  </p>

                </div>
              )}

              <div className="mt-5">

                <label className="block text-sm font-bold">
                  Image URL
                </label>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) =>
                    setImageUrl(e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />

              </div>

            </div>

            {/* PREVIEW */}

            {slug && (
              <Link
                href={`/blog/${slug}`}
                target="_blank"
                className="flex w-full items-center justify-center rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 text-sm font-bold text-purple-700 shadow-sm"
              >
                👁 Preview Article
              </Link>
            )}

            {/* CANCEL */}

            <Link
              href="/admin"
              className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-sm"
            >
              ← Cancel and Return
            </Link>

          </aside>

        </div>

      </section>

      {/* EDITOR PLACEHOLDER STYLE */}

      <style jsx>{`
        .article-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }

        .article-editor h1 {
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.2;
          margin: 1.5rem 0 1rem;
        }

        .article-editor h2 {
          font-size: 1.6rem;
          font-weight: 900;
          line-height: 1.3;
          margin: 1.5rem 0 1rem;
        }

        .article-editor h3 {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 1.25rem 0 0.75rem;
        }

        .article-editor p {
          margin-bottom: 1.2rem;
        }

        .article-editor ul,
        .article-editor ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .article-editor li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 640px) {
          .article-editor {
            min-height: 500px;
            padding: 1rem;
            font-size: 16px;
            line-height: 1.9;
          }

          .article-editor h1 {
            font-size: 1.7rem;
          }

          .article-editor h2 {
            font-size: 1.4rem;
          }

          .article-editor h3 {
            font-size: 1.2rem;
          }
        }
      `}</style>

    </main>
  );
}