"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

export default function EditArticlePage() {
const params = useParams();
const router = useRouter();
const editorRef = useRef<HTMLDivElement>(null);

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

const [status, setStatus] =
useState<"draft" | "published">("draft");

const [editorMode, setEditorMode] =
useState<"edit" | "preview">("edit");

function generateSlug(value: string) {
return value
.toLowerCase()
.trim()
.replace(/[^a-z0-9\s-]/g, "")
.replace(/\s+/g, "-")
.replace(/-+/g, "-")
.replace(/^-+|-+$/g, "");
}

function htmlToPlainText(html: string) {
if (typeof window === "undefined") {
return html.replace(/<[^>]*>/g, " ");
}

const temporaryElement = document.createElement("div");
temporaryElement.innerHTML = html;

return (
  temporaryElement.textContent ||
  temporaryElement.innerText ||
  ""
)
  .replace(/\u00a0/g, " ")
  .replace(/\s+/g, " ")
  .trim();

}

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
      article.status === "published"
        ? "published"
        : "draft"
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

useEffect(() => {
if (
editorMode === "edit" &&
editorRef.current &&
editorRef.current.innerHTML !== content
) {
editorRef.current.innerHTML = content;
}
}, [content, editorMode]);

function handleTitleChange(value: string) {
const currentGeneratedSlug = generateSlug(title);

setTitle(value);

if (!slug || slug === currentGeneratedSlug) {
  setSlug(generateSlug(value));
}

}

function handleEditorInput() {
if (!editorRef.current) return;

setContent(editorRef.current.innerHTML);

}

function formatText(command: string, value?: string) {
editorRef.current?.focus();

document.execCommand(command, false, value);

handleEditorInput();

}

function formatBlock(tag: string) {
editorRef.current?.focus();

document.execCommand("formatBlock", false, tag);

handleEditorInput();

}

function changeFontSize(size: string) {
if (!editorRef.current) return;

editorRef.current.focus();

const selection = window.getSelection();

if (!selection || selection.rangeCount === 0) {
  return;
}

const range = selection.getRangeAt(0);

if (range.collapsed) {
  return;
}

const selectedContent = range.extractContents();

const span = document.createElement("span");
span.style.fontSize = `${size}px`;

span.appendChild(selectedContent);

range.insertNode(span);

selection.removeAllRanges();

const newRange = document.createRange();
newRange.selectNodeContents(span);

selection.addRange(newRange);

handleEditorInput();

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

const plainArticleContent = htmlToPlainText(content);

if (!plainArticleContent.trim()) {
  alert("Please enter article content.");
  return;
}

setSaving(true);

try {
  const finalSlug = generateSlug(slug);

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

const plainText = htmlToPlainText(content);

const wordCount = plainText.trim()
? plainText.trim().split(/\s+/).length
: 0;

const readTime = Math.max(
1,
Math.ceil(wordCount / 220)
);

if (loading) {
return (
<main className="min-h-screen bg-[#f4f1eb]">
<div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
<div className="animate-pulse space-y-6">
<div className="h-12 w-64 bg-stone-200" />
<div className="h-48 bg-stone-200" />
<div className="h-[600px] bg-stone-200" />
</div>
</div>
</main>
);
}

return (
<main className="min-h-screen bg-[#f4f1eb] text-stone-900">

  {/* HEADER */}

  <header className="sticky top-0 z-50 border-b border-stone-300 bg-[#faf8f3]/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">

      <Link
        href="/"
        className="flex min-w-0 items-center gap-3"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-lg font-black text-[#f4f1eb]">
          G
        </div>

        <div>
          <p className="text-lg font-black tracking-tight text-stone-950">
            GLOBALYN
          </p>

          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
            Editorial Studio
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-3">

        <Link
          href="/admin"
          className="hidden border border-stone-300 bg-transparent px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-100 sm:block"
        >
          ← Back
        </Link>

        <button
          type="button"
          onClick={saveArticle}
          disabled={saving}
          className="bg-stone-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </div>
  </header>

  {/* EDITORIAL HERO */}

  <section className="border-b border-stone-300 bg-[#faf8f3]">
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

      <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">

        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-stone-500">
            GLOBALYN EDITORIAL
          </p>

          <h1 className="mt-5 max-w-3xl font-serif text-5xl font-black leading-[1.05] tracking-tight text-stone-950 sm:text-6xl">
            Shape your next
            <span className="block italic text-stone-500">
              great story.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
            Write, edit and publish stories about technology,
            innovation, business and the ideas shaping tomorrow.
          </p>
        </div>

        <div className="flex gap-3">

          <div className="border border-stone-300 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Words
            </p>

            <p className="mt-2 text-3xl font-black text-stone-950">
              {wordCount}
            </p>
          </div>

          <div className="border border-stone-300 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Reading
            </p>

            <p className="mt-2 text-3xl font-black text-stone-950">
              {readTime}m
            </p>
          </div>

        </div>

      </div>
    </div>
  </section>

  {/* MAIN CONTENT */}

  <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">

    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">

      {/* LEFT SIDE */}

      <div className="space-y-8">

        {/* ARTICLE INFORMATION */}

        <div className="border border-stone-300 bg-[#faf8f3] p-6 sm:p-10">

          <div className="border-b border-stone-300 pb-6">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
              Article Details
            </p>

            <h2 className="mt-3 font-serif text-3xl font-black text-stone-950">
              The essentials
            </h2>

          </div>

          <div className="mt-8">

            <label className="text-sm font-bold text-stone-800">
              Article Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                handleTitleChange(e.target.value)
              }
              placeholder="Enter your article title..."
              className="mt-3 w-full border-b-2 border-stone-300 bg-transparent px-0 py-4 text-xl font-bold outline-none transition focus:border-stone-950"
            />

          </div>

          <div className="mt-8">

            <label className="text-sm font-bold text-stone-800">
              Article URL *
            </label>

            <div className="mt-3 flex border-b-2 border-stone-300">

              <span className="flex items-center py-4 pr-3 text-sm font-bold text-stone-400">
                /blog/
              </span>

              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(generateSlug(e.target.value))
                }
                placeholder="article-url"
                className="min-w-0 flex-1 bg-transparent py-4 text-sm font-semibold outline-none"
              />

            </div>

          </div>

          <div className="mt-8">

            <label className="text-sm font-bold text-stone-800">
              Article Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(e) =>
                setExcerpt(e.target.value)
              }
              rows={4}
              placeholder="Write a short summary of your article..."
              className="mt-3 w-full border border-stone-300 bg-white p-4 leading-7 outline-none transition focus:border-stone-950"
            />

          </div>

        </div>

        {/* ARTICLE CONTENT */}

        <div className="border border-stone-300 bg-[#faf8f3] p-6 sm:p-10">

          <div className="flex flex-col justify-between gap-5 border-b border-stone-300 pb-6 sm:flex-row sm:items-end">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                The Story
              </p>

              <h2 className="mt-3 font-serif text-3xl font-black text-stone-950">
                Write your article
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Your formatting will be preserved.
              </p>

            </div>

            <p className="text-sm font-bold text-stone-500">
              {wordCount} words
            </p>

          </div>

          {/* EDIT / PREVIEW */}

          <div className="mt-6 flex gap-2 border-b border-stone-300 pb-4">

            <button
              type="button"
              onClick={() => setEditorMode("edit")}
              className={`px-5 py-2.5 text-sm font-bold transition ${
                editorMode === "edit"
                  ? "bg-stone-950 text-white"
                  : "border border-stone-300 bg-white text-stone-600 hover:bg-stone-100"
              }`}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => setEditorMode("preview")}
              className={`px-5 py-2.5 text-sm font-bold transition ${
                editorMode === "preview"
                  ? "bg-stone-950 text-white"
                  : "border border-stone-300 bg-white text-stone-600 hover:bg-stone-100"
              }`}
            >
              Preview
            </button>

          </div>

          {editorMode === "edit" ? (

            <div className="mt-6 border border-stone-300 bg-white">

              {/* TOOLBAR */}

              <div className="flex flex-wrap items-center gap-2 border-b border-stone-300 bg-stone-100 p-3">

                {/* HEADINGS */}

                <button
                  type="button"
                  onClick={() => formatBlock("h1")}
                  className="h-10 border border-stone-300 bg-white px-3 text-sm font-black"
                  title="Heading 1"
                >
                  H1
                </button>

                <button
                  type="button"
                  onClick={() => formatBlock("h2")}
                  className="h-10 border border-stone-300 bg-white px-3 text-sm font-black"
                  title="Heading 2"
                >
                  H2
                </button>

                <button
                  type="button"
                  onClick={() => formatBlock("h3")}
                  className="h-10 border border-stone-300 bg-white px-3 text-sm font-black"
                  title="Heading 3"
                >
                  H3
                </button>

                <button
                  type="button"
                  onClick={() => formatBlock("p")}
                  className="h-10 border border-stone-300 bg-white px-3 text-sm font-bold"
                  title="Paragraph"
                >
                  P
                </button>

                {/* BASIC FORMATTING */}

                <button
                  type="button"
                  onClick={() => formatText("bold")}
                  className="h-10 min-w-10 border border-stone-300 bg-white px-3 font-black"
                  title="Bold"
                >
                  B
                </button>

                <button
                  type="button"
                  onClick={() => formatText("italic")}
                  className="h-10 min-w-10 border border-stone-300 bg-white px-3 font-bold italic"
                  title="Italic"
                >
                  I
                </button>

                <button
                  type="button"
                  onClick={() => formatText("underline")}
                  className="h-10 min-w-10 border border-stone-300 bg-white px-3 font-bold underline"
                  title="Underline"
                >
                  U
                </button>


{/* FONT SIZE */}

<select
  defaultValue=""
  onChange={(e) => {
    if (e.target.value) {
      changeFontSize(e.target.value);
      e.target.value = "";
    }
  }}
  className="h-10 border border-stone-300 bg-white px-3 text-sm font-bold outline-none"
  title="Font Size"
>
  <option value="" disabled>
    Size
  </option>

  <option value="8">8 px</option>
  <option value="10">10 px</option>
  <option value="12">12 px</option>
  <option value="14">14 px</option>
  <option value="15">15 px</option>
  <option value="16">16 px</option>
  <option value="18">18 px</option>
  <option value="20">20 px</option>
  <option value="22">22 px</option>
  <option value="24">24 px</option>
  <option value="25">25 px</option>
  <option value="28">28 px</option>
  <option value="30">30 px</option>
  <option value="32">32 px</option>
  <option value="36">36 px</option>
  <option value="40">40 px</option>
  <option value="48">48 px</option>
</select>

                {/* LISTS */}

                <button
                  type="button"
                  onClick={() =>
                    formatText("insertUnorderedList")
                  }
                  className="h-10 border border-stone-300 bg-white px-3 text-sm font-bold"
                  title="Bullet List"
                >
                  • List
                </button>

                <button
                  type="button"
                  onClick={() =>
                    formatText("insertOrderedList")
                  }
                  className="h-10 border border-stone-300 bg-white px-3 text-sm font-bold"
                  title="Numbered List"
                >
                  1. List
                </button>

                {/* ALIGNMENT */}

                <button
                  type="button"
                  onClick={() =>
                    formatText("justifyLeft")
                  }
                  className="h-10 border border-stone-300 bg-white px-3 font-bold"
                  title="Align Left"
                >
                  ☰
                </button>

                <button
                  type="button"
                  onClick={() =>
                    formatText("justifyCenter")
                  }
                  className="h-10 border border-stone-300 bg-white px-3 font-bold"
                  title="Align Center"
                >
                  ≡
                </button>

                <button
                  type="button"
                  onClick={() =>
                    formatText("justifyRight")
                  }
                  className="h-10 border border-stone-300 bg-white px-3 font-bold"
                  title="Align Right"
                >
                  ☷
                </button>

              </div>

              {/* EDITOR */}

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                className="min-h-[550px] w-full px-6 py-6 text-base leading-8 text-stone-700 outline-none sm:min-h-[650px] sm:px-8 sm:py-8"
              />

            </div>

          ) : (

            <div
              className="article-preview mt-6 border border-stone-300 bg-white p-6 sm:p-10"
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />

          )}

          <div className="mt-5 flex justify-between border-t border-stone-300 pt-5 text-xs font-medium text-stone-400">

            <span>{wordCount} words</span>

            <span>{content.length} characters</span>

          </div>

        </div>

      </div>

      {/* SIDEBAR */}

      <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">

        {/* PUBLISHING */}

        <div className="bg-stone-950 p-7 text-white">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
            Publishing
          </p>

          <h2 className="mt-3 font-serif text-2xl font-black">
            Ready to publish?
          </h2>

          <p className="mt-3 text-sm leading-6 text-stone-400">
            Choose whether this story stays private or becomes publicly visible.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => setStatus("draft")}
              className={`py-3 text-sm font-bold transition ${
                status === "draft"
                  ? "bg-white text-stone-950"
                  : "border border-white/20 text-stone-400"
              }`}
            >
              Draft
            </button>

            <button
              type="button"
              onClick={() => setStatus("published")}
              className={`py-3 text-sm font-bold transition ${
                status === "published"
                  ? "bg-emerald-500 text-white"
                  : "border border-white/20 text-stone-400"
              }`}
            >
              Published
            </button>

          </div>

          <button
            type="button"
            onClick={saveArticle}
            disabled={saving}
            className="mt-5 w-full bg-white px-4 py-4 text-sm font-black text-stone-950 transition hover:bg-stone-200 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

        {/* SETTINGS */}

        <div className="border border-stone-300 bg-[#faf8f3] p-6">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            Settings
          </p>

          <h2 className="mt-3 font-serif text-2xl font-black">
            Article details
          </h2>

          <div className="mt-7">

            <label className="text-sm font-bold">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="mt-3 w-full border border-stone-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-stone-950"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

          <div className="mt-6">

            <label className="text-sm font-bold">
              Author
            </label>

            <input
              type="text"
              value={author}
              onChange={(e) =>
                setAuthor(e.target.value)
              }
              placeholder="Enter author name..."
              className="mt-3 w-full border border-stone-300 bg-white px-4 py-3.5 outline-none focus:border-stone-950"
            />

          </div>

        </div>

        {/* FEATURED IMAGE */}

        <div className="border border-stone-300 bg-[#faf8f3] p-6">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            Visual
          </p>

          <h2 className="mt-3 font-serif text-2xl font-black">
            Featured image
          </h2>

          <p className="mt-3 text-sm leading-6 text-stone-500">
            Add or update the main image for this story.
          </p>

          {imageUrl ? (

            <div className="mt-6">

              <img
                src={imageUrl}
                alt="Article preview"
                className="h-52 w-full border border-stone-300 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <button
                type="button"
                onClick={removeImage}
                className="mt-4 w-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                Remove Image
              </button>

            </div>

          ) : (

            <div className="mt-6 border-2 border-dashed border-stone-300 bg-stone-100 px-5 py-10 text-center">

              <p className="text-3xl">🖼️</p>

              <p className="mt-3 text-sm font-medium text-stone-500">
                No featured image
              </p>

            </div>

          )}

          <div className="mt-6">

            <label className="text-sm font-bold">
              Image URL
            </label>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) =>
                setImageUrl(e.target.value)
              }
              placeholder="https://example.com/image.jpg"
              className="mt-3 w-full border border-stone-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-stone-950"
            />

          </div>

        </div>

        {/* PREVIEW */}

        {slug && (

          <Link
            href={`/blog/${slug}`}
            target="_blank"
            className="flex w-full items-center justify-center border border-stone-900 bg-transparent px-5 py-4 text-sm font-bold text-stone-900 transition hover:bg-stone-900 hover:text-white"
          >
            👁 Preview Article
          </Link>

        )}

        <Link
          href="/admin"
          className="flex w-full items-center justify-center border border-stone-300 bg-white px-5 py-4 text-sm font-bold text-stone-600 transition hover:bg-stone-100"
        >
          ← Cancel and Return
        </Link>

      </aside>

    </div>

  </section>

  <style jsx>{`
    .article-preview {
      color: #44403c;
    }

    .article-preview h1 {
      font-size: 2.25rem;
      font-weight: 900;
      line-height: 1.15;
      color: #1c1917;
      margin: 2rem 0 1rem;
    }

    .article-preview h2 {
      font-size: 1.8rem;
      font-weight: 900;
      line-height: 1.25;
      color: #1c1917;
      margin: 2rem 0 1rem;
    }

    .article-preview h3 {
      font-size: 1.4rem;
      font-weight: 800;
      color: #1c1917;
      margin: 1.5rem 0 0.75rem;
    }

    .article-preview p {
      margin-bottom: 1.25rem;
      line-height: 1.9;
    }

    .article-preview ul,
    .article-preview ol {
      margin: 1.25rem 0;
      padding-left: 1.5rem;
    }

    .article-preview li {
      margin-bottom: 0.5rem;
      line-height: 1.8;
    }

    .article-preview ul {
      list-style: disc;
    }

    .article-preview ol {
      list-style: decimal;
    }

    .article-preview strong {
      font-weight: 800;
      color: #1c1917;
    }

    .article-preview img {
      max-width: 100%;
      height: auto;
    }
  `}</style>

</main>

);
}