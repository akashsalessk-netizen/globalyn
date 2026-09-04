"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
"World News",
"Global News",
"Finance",
"Economy",
"Politics",
"Science",
"Health",
"Environment",
"Entertainment",
];

function generateSlug(value: string) {
return value
.toLowerCase()
.trim()
.replace(/[^a-z0-9\s-]/g, "")
.replace(/\s+/g, "-")
.replace(/-+/g, "-")
.replace(/^-+|-+$/g, "");
}

export default function EditArticlePage() {
const params = useParams();
const router = useRouter();

const idParam = params.id;
const articleId = Array.isArray(idParam) ? idParam[0] : idParam;

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

const [title, setTitle] = useState("");
const [slug, setSlug] = useState("");
const [excerpt, setExcerpt] = useState("");
const [category, setCategory] = useState("Technology");
const [author, setAuthor] = useState("");
const [content, setContent] = useState("");
const [imageUrl, setImageUrl] = useState("");
const [status, setStatus] = useState<"draft" | "published">("draft");

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
    setCategory(article.category || "Technology");
    setAuthor(article.author || "");
    setContent(article.content || "");
    setImageUrl(article.image_url || "");
    setStatus(
      article.status === "published" ? "published" : "draft"
    );
  } catch (error) {
    console.error("Load article error:", error);

    alert("Could not load this article.");

    router.push("/admin");
  } finally {
    setLoading(false);
  }
}

loadArticle();

}, [articleId, router]);

function handleTitleChange(value: string) {
const currentGeneratedSlug = generateSlug(title);

setTitle(value);

if (!slug || slug === currentGeneratedSlug) {
  setSlug(generateSlug(value));
}

}

async function saveArticle() {
if (!articleId) {
alert("Article ID is missing.");
return;
}

if (!title.trim()) {
  alert("Please enter an article title.");
  return;
}

if (!slug.trim()) {
  alert("Please enter an article URL.");
  return;
}

if (!content.trim()) {
  alert("Please enter article content.");
  return;
}

setSaving(true);

try {
  const finalSlug = generateSlug(slug);

  if (!finalSlug) {
    alert("Please enter a valid article URL.");
    return;
  }

  const { data: existingArticle, error: slugError } =
    await supabase
      .from("articles")
      .select("id")
      .eq("slug", finalSlug)
      .neq("id", articleId)
      .maybeSingle();

  if (slugError) {
    throw slugError;
  }

  if (existingArticle) {
    alert("This article URL is already being used.");
    return;
  }

  const { error } = await supabase
    .from("articles")
    .update({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      category: category || null,
      author: author.trim() || null,
      content,
      image_url: imageUrl.trim() || null,
      status,
    })
    .eq("id", articleId);

  if (error) {
    throw error;
  }

  alert(
    status === "published"
      ? "Article updated and published successfully!"
      : "Article saved as a draft!"
  );

  router.push("/admin");
  router.refresh();
} catch (error) {
  console.error("Save article error:", error);

  alert(
    error instanceof Error
      ? `Could not save article: ${error.message}`
      : "Something went wrong while saving the article."
  );
} finally {
  setSaving(false);
}

}

function removeImage() {
if (!imageUrl) return;

if (
  window.confirm(
    "Are you sure you want to remove the featured image?"
  )
) {
  setImageUrl("");
}

}

const plainText = content
.replace(/<[^>]*>/g, " ")
.replace(/\s+/g, " ")
.trim();

const wordCount = plainText
? plainText.split(/\s+/).length
: 0;

const readTime = Math.max(
1,
Math.ceil(wordCount / 220)
);

if (loading) {
return (
<main className="min-h-screen bg-slate-50">
<div className="mx-auto max-w-7xl px-6 py-12">
<div className="animate-pulse space-y-6">
<div className="h-12 w-64 rounded-lg bg-slate-200" />
<div className="h-40 rounded-2xl bg-slate-200" />
<div className="h-[600px] rounded-2xl bg-slate-200" />
</div>
</div>
</main>
);
}

return (
<main className="min-h-screen bg-slate-50 text-slate-900">

  <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

      <Link
        href="/"
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-lg font-black text-white">
          G
        </div>

        <div>
          <p className="font-black tracking-tight">
            GLOBALYN
          </p>

          <p className="text-xs text-slate-400">
            Edit Article
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-3">

        <Link
          href="/admin"
          className="hidden rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 sm:block"
        >
          ← Back
        </Link>

        <button
          type="button"
          onClick={saveArticle}
          disabled={saving}
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </div>
  </header>

  <section className="border-b border-slate-200 bg-white">
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">

      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Content Editor
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Edit your article.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
            Update your story, content, image and publishing settings.
          </p>
        </div>

        <div className="flex gap-4">

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Words
            </p>

            <p className="mt-1 text-2xl font-black">
              {wordCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Read Time
            </p>

            <p className="mt-1 text-2xl font-black">
              {readTime} min
            </p>
          </div>

        </div>
      </div>
    </div>
  </section>

  <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">

    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">

      <div className="space-y-8">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-xl font-black">
              Article Information
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Basic information about your article.
            </p>
          </div>

          <div className="mt-7">

            <label className="block text-sm font-bold text-slate-800">
              Article Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                handleTitleChange(e.target.value)
              }
              placeholder="Enter your article title..."
              className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-3.5 text-lg font-semibold outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
            />

          </div>

          <div className="mt-7">

            <label className="block text-sm font-bold text-slate-800">
              Article URL *
            </label>

            <p className="mt-1 text-sm text-slate-500">
              This creates your article link.
            </p>

            <div className="mt-3 flex overflow-hidden rounded-lg border border-slate-300">

              <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400">
                /blog/
              </span>

              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(generateSlug(e.target.value))
                }
                placeholder="article-url"
                className="min-w-0 flex-1 px-4 py-3.5 text-sm font-semibold outline-none"
              />

            </div>
          </div>

          <div className="mt-7">

            <label className="block text-sm font-bold text-slate-800">
              Article Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(e) =>
                setExcerpt(e.target.value)
              }
              rows={4}
              placeholder="Write a short summary of your article..."
              className="mt-3 w-full resize-none rounded-lg border border-slate-300 px-4 py-3.5 leading-7 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
            />

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-xl font-black">
              Article Content
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Write the complete article content.
            </p>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={28}
            placeholder="Write your complete article here..."
            className="mt-6 min-h-[600px] w-full resize-y rounded-lg border border-slate-300 px-5 py-5 text-base leading-8 text-slate-700 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
          />

          <div className="mt-4 flex justify-between text-xs text-slate-400">
            <span>{wordCount} words</span>
            <span>{content.length} characters</span>
          </div>

        </div>

      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">

        <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg">

          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Publishing
          </p>

          <h2 className="mt-3 text-xl font-black">
            Publishing Status
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => setStatus("draft")}
              className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
                status === "draft"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-400"
              }`}
            >
              Draft
            </button>

            <button
              type="button"
              onClick={() => setStatus("published")}
              className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
                status === "published"
                  ? "bg-emerald-500 text-white"
                  : "border border-white/10 bg-white/5 text-slate-400"
              }`}
            >
              Published
            </button>

          </div>

          <button
            type="button"
            onClick={saveArticle}
            disabled={saving}
            className="mt-4 w-full rounded-lg bg-white px-4 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-black">
            Article Settings
          </h2>

          <div className="mt-6">

            <label className="block text-sm font-bold text-slate-800">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

          <div className="mt-6">

            <label className="block text-sm font-bold text-slate-800">
              Author
            </label>

            <input
              type="text"
              value={author}
              onChange={(e) =>
                setAuthor(e.target.value)
              }
              placeholder="Enter author name..."
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none"
            />

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-black">
            Featured Image
          </h2>

          {imageUrl ? (
            <div className="mt-5">

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">

                <img
                  src={imageUrl}
                  alt="Article preview"
                  className="h-52 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

              </div>

              <button
                type="button"
                onClick={removeImage}
                className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
              >
                Remove Image
              </button>

            </div>
          ) : (
            <div className="mt-5 rounded-xl border-2 border-dashed border-slate-200 px-5 py-8 text-center">

              <div className="text-3xl">🖼️</div>

              <p className="mt-3 text-sm text-slate-400">
                No featured image
              </p>

            </div>
          )}

          <div className="mt-5">

            <label className="block text-sm font-bold text-slate-800">
              Image URL
            </label>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) =>
                setImageUrl(e.target.value)
              }
              placeholder="https://example.com/image.jpg"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
            />

          </div>

        </div>

        {slug && (
          <Link
            href={`/blog/${slug}`}
            target="_blank"
            className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700"
          >
            👁 Preview Article
          </Link>
        )}

        <Link
          href="/admin"
          className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-600"
        >
          ← Cancel and return
        </Link>

      </aside>

    </div>

  </section>

</main>

);
}