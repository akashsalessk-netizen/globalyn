"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

const COLORS = [
  { name: "Black", value: "#111827" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Amber", value: "#d97706" },
  { name: "Yellow", value: "#ca8a04" },
  { name: "Green", value: "#16a34a" },
  { name: "Emerald", value: "#059669" },
  { name: "Teal", value: "#0d9488" },
  { name: "Cyan", value: "#0891b2" },
  { name: "Blue", value: "#2563eb" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Purple", value: "#9333ea" },
  { name: "Pink", value: "#db2777" },
  { name: "Rose", value: "#e11d48" },
  { name: "Gray", value: "#64748b" },
];

const HIGHLIGHTS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Purple", value: "#ddd6fe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Red", value: "#fecaca" },
  { name: "Cyan", value: "#a5f3fc" },
];

const TEXT_SIZES = [
  "14px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
  "26px",
  "28px",
  "30px",
  "32px",
  "36px",
  "40px",
];

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

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const idParam = params.id;

  const articleId = Array.isArray(idParam)
    ? idParam[0]
    : idParam;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Technology");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const [status, setStatus] = useState<"draft" | "published">(
    "draft"
  );

  const [imageUrl, setImageUrl] = useState("");

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState("");

  const [editorReady, setEditorReady] = useState(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function saveSelection() {
    const selection = window.getSelection();

    if (
      selection &&
      selection.rangeCount > 0 &&
      editorRef.current?.contains(selection.anchorNode)
    ) {
      savedRangeRef.current = selection
        .getRangeAt(0)
        .cloneRange();
    }
  }

  function restoreSelection() {
    const selection = window.getSelection();

    if (selection && savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  }

  function syncContent() {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }

  function prepareEditor() {
    editorRef.current?.focus();
    restoreSelection();
  }

  function exec(command: string, value?: string) {
    prepareEditor();

    document.execCommand(command, false, value);

    saveSelection();
    syncContent();
  }

  function formatBlock(tag: string) {
    prepareEditor();

    document.execCommand("formatBlock", false, tag);

    saveSelection();
    syncContent();
  }

  function changeTextSize(size: string) {
    prepareEditor();

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (range.collapsed) {
      alert("Please select the text you want to resize.");
      return;
    }

    const span = document.createElement("span");

    span.style.fontSize = size;

    try {
      range.surroundContents(span);
    } catch {
      const selectedContent = range.extractContents();

      span.appendChild(selectedContent);

      range.insertNode(span);

      const newRange = document.createRange();

      newRange.selectNodeContents(span);

      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    saveSelection();
    syncContent();
  }

  function addLink() {
    const url = window.prompt("Enter URL:");

    if (!url) return;

    prepareEditor();

    document.execCommand("createLink", false, url);

    saveSelection();
    syncContent();
  }

  function removeFormatting() {
    prepareEditor();

    document.execCommand("removeFormat", false);

    saveSelection();
    syncContent();
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
        setImagePreview(article.image_url || "");

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

  /*
    IMPORTANT:
    This effect loads HTML as REAL HTML into the editor.
    It does NOT display HTML tags as plain text.
  */

  useEffect(() => {
    if (
      !loading &&
      editorReady &&
      editorRef.current
    ) {
      editorRef.current.innerHTML = content || "";
    }
  }, [loading, editorReady]);

  function handleTitleChange(value: string) {
    const currentGeneratedSlug = generateSlug(title);

    setTitle(value);

    if (!slug || slug === currentGeneratedSlug) {
      setSlug(generateSlug(value));
    }
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  function removeImage() {
    const confirmed = window.confirm(
      "Are you sure you want to remove the featured image?"
    );

    if (!confirmed) return;

    setImageFile(null);
    setImageUrl("");
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const wordCount = useMemo(() => {
    const plainText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return plainText
      ? plainText.split(" ").filter(Boolean).length
      : 0;
  }, [content]);

  const readTime = Math.max(
    1,
    Math.ceil(wordCount / 220)
  );

  async function saveArticle() {
    if (!articleId) {
      alert("Article ID is missing.");
      return;
    }

    const finalContent =
      editorRef.current?.innerHTML || content;

    if (!title.trim()) {
      alert("Please enter an article title.");
      return;
    }

    if (!slug.trim()) {
      alert("Please enter an article URL.");
      return;
    }

    if (
      !finalContent.replace(/<[^>]*>/g, "").trim()
    ) {
      alert("Please enter article content.");
      return;
    }

    setSaving(true);

    try {
      const finalSlug = generateSlug(slug);

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
        alert("This article URL is already being used.");
        return;
      }

      let finalImageUrl = imageUrl;

      if (imageFile) {
        const extension =
          imageFile.name.split(".").pop() || "jpg";

        const fileName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${extension}`;

        const filePath = `articles/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("article-images")
            .upload(filePath, imageFile, {
              upsert: false,
            });

        if (uploadError) {
          throw new Error(
            "Image upload failed: " +
              uploadError.message
          );
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("article-images")
            .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from("articles")
        .update({
          title: title.trim(),
          slug: finalSlug,
          excerpt: excerpt.trim() || null,
          category: category.trim() || null,
          author: author.trim() || null,
          content: finalContent,
          image_url: finalImageUrl || null,
          status,
        })
        .eq("id", articleId);

      if (error) {
        throw error;
      }

      setContent(finalContent);

      alert(
        status === "published"
          ? "🎉 Article updated and published successfully!"
          : "✓ Article saved as a draft!"
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 w-64 rounded-xl bg-slate-200" />
            <div className="h-40 rounded-3xl bg-slate-200" />
            <div className="h-[600px] rounded-3xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">

      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 font-black text-white shadow-lg">
              G
            </div>

            <div>
              <p className="text-lg font-black text-slate-950">
                GLOBALYN
              </p>

              <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Admin Studio
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">

            <Link
              href="/admin"
              className="hidden rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm sm:block"
            >
              ← Dashboard
            </Link>

            <button
              type="button"
              onClick={saveArticle}
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 px-5 py-2.5 text-sm font-black text-white shadow-lg disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>
        </div>
      </header>

      <section className="border-b border-white/60">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-violet-600 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
                Content Editor
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Edit your story beautifully.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500">
                Update your article, formatting, featured image
                and publishing settings.
              </p>
            </div>

            <div className="flex gap-3">

              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Words
                </p>

                <p className="mt-1 text-2xl font-black">
                  {wordCount}
                </p>
              </div>

              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Read time
                </p>

                <p className="mt-1 text-2xl font-black">
                  {readTime} min
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">

          <div className="space-y-7">

            <div className="rounded-[2rem] bg-white p-6 shadow-xl sm:p-9">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
                Story details
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Article information
              </h2>

              <label className="mt-8 block">

                <span className="text-sm font-black">
                  Article title
                </span>

                <input
                  value={title}
                  onChange={(e) =>
                    handleTitleChange(e.target.value)
                  }
                  className="mt-3 w-full border-b-2 border-slate-200 px-0 py-4 text-2xl font-black outline-none focus:border-violet-500"
                  placeholder="Write a powerful headline..."
                />

              </label>

              <label className="mt-8 block">

                <span className="text-sm font-black">
                  Article URL
                </span>

                <div className="mt-3 flex overflow-hidden rounded-xl border border-slate-200">

                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400">
                    /blog/
                  </span>

                  <input
                    value={slug}
                    onChange={(e) =>
                      setSlug(generateSlug(e.target.value))
                    }
                    className="min-w-0 flex-1 px-4 py-3 text-sm font-semibold outline-none"
                    placeholder="article-url"
                  />

                </div>

              </label>

              <label className="mt-8 block">

                <span className="text-sm font-black">
                  Article excerpt
                </span>

                <textarea
                  value={excerpt}
                  onChange={(e) =>
                    setExcerpt(e.target.value)
                  }
                  rows={4}
                  className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:border-violet-400"
                  placeholder="Write a short summary..."
                />

              </label>

            </div>

            {/* RICH TEXT EDITOR */}

            <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">

              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">

                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
                  Article editor
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Edit your story
                </h2>

              </div>

              {/* TOOLBAR */}

              <div className="border-b border-slate-200 bg-slate-50 p-4">

                <div className="flex flex-wrap gap-2">

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => exec("bold")}
                    className="toolbar-button font-black"
                  >
                    B
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => exec("italic")}
                    className="toolbar-button italic"
                  >
                    I
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => exec("underline")}
                    className="toolbar-button underline"
                  >
                    U
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => exec("strikeThrough")}
                    className="toolbar-button line-through"
                  >
                    S
                  </button>

                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        formatBlock(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"
                  >
                    <option value="" disabled>
                      Heading
                    </option>

                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="p">Paragraph</option>

                  </select>

                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        changeTextSize(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="h-10 rounded-xl border border-violet-200 bg-white px-3 text-sm font-bold text-violet-700"
                  >
                    <option value="" disabled>
                      Text Size
                    </option>

                    {TEXT_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}

                  </select>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => exec("insertUnorderedList")}
                    className="toolbar-button text-xs"
                  >
                    • List
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => exec("insertOrderedList")}
                    className="toolbar-button text-xs"
                  >
                    1. List
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatBlock("blockquote")}
                    className="toolbar-button"
                  >
                    ❝
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={addLink}
                    className="toolbar-button"
                  >
                    ↗
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={removeFormatting}
                    className="toolbar-button text-xs"
                  >
                    Clear
                  </button>

                </div>

                <div className="mt-5 border-t border-slate-200 pt-5">

                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Text color
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        title={color.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          exec("foreColor", color.value)
                        }
                        className="h-7 w-7 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200"
                        style={{
                          backgroundColor: color.value,
                        }}
                      />
                    ))}

                  </div>

                  <p className="mt-5 text-xs font-black uppercase tracking-wider text-slate-400">
                    Highlight
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {HIGHLIGHTS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          exec("hiliteColor", color.value)
                        }
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold"
                        style={{
                          backgroundColor: color.value,
                        }}
                      >
                        {color.name}
                      </button>
                    ))}

                  </div>

                </div>

              </div>

              {/* THE IMPORTANT FIXED EDITOR */}

              <div
                ref={(element) => {
                  editorRef.current = element;

                  if (element) {
                    setEditorReady(true);
                  }
                }}
                contentEditable
                suppressContentEditableWarning
                onInput={syncContent}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                onBlur={saveSelection}
                className="article-editor min-h-[650px] bg-white px-6 py-8 text-lg leading-9 text-slate-700 outline-none sm:px-10 sm:py-10"
                data-placeholder="Start writing your story here..."
              />

              <div className="flex justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs font-semibold text-slate-400">

                <span>{wordCount} words</span>

                <span>
                  Estimated {readTime} min read
                </span>

              </div>

            </div>

          </div>

          {/* SIDEBAR */}

          <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">

            <div className="rounded-[2rem] bg-slate-950 p-6 shadow-2xl">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">
                Publishing
              </p>

              <h2 className="mt-3 text-2xl font-black text-white">
                Ready to update?
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  className={`rounded-xl px-4 py-3 font-black ${
                    status === "draft"
                      ? "bg-white text-slate-950"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  Draft
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("published")}
                  className={`rounded-xl px-4 py-3 font-black ${
                    status === "published"
                      ? "bg-violet-500 text-white"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  Published
                </button>

              </div>

              <button
                type="button"
                onClick={saveArticle}
                disabled={saving}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 px-5 py-4 font-black text-white disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : status === "published"
                  ? "🚀 Update & Publish"
                  : "💾 Save Draft"}
              </button>

            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
                Article settings
              </p>

              <div className="mt-6">

                <label className="text-sm font-black">
                  Category
                </label>

                <input
                  list="article-categories"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-500"
                />

                <datalist id="article-categories">
                  {CATEGORIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    />
                  ))}
                </datalist>

              </div>

              <label className="mt-7 block">

                <span className="text-sm font-black">
                  Author
                </span>

                <input
                  value={author}
                  onChange={(e) =>
                    setAuthor(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
                  placeholder="Author name"
                />

              </label>

            </div>

            {/* FEATURED IMAGE */}

            <div className="rounded-[2rem] bg-white p-6 shadow-lg">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
                Media
              </p>

              <h2 className="mt-2 text-xl font-black">
                Featured image
              </h2>

              {imagePreview ? (
                <div className="mt-5">

                  <img
                    src={imagePreview}
                    alt="Featured preview"
                    className="h-52 w-full rounded-2xl object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-4 w-full rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700"
                  >
                    📁 Replace Image
                  </button>

                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
                  >
                    Remove Image
                  </button>

                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-5 flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center hover:border-violet-300"
                >
                  <span className="text-4xl">🖼️</span>

                  <span className="mt-4 text-sm font-black">
                    Upload a featured image
                  </span>

                  <span className="mt-1 text-xs text-slate-400">
                    Upload from your computer
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

            </div>

            {slug && (
              <Link
                href={`/blog/${slug}`}
                target="_blank"
                className="flex w-full justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-600"
              >
                👁 Preview Article
              </Link>
            )}

            <Link
              href="/admin"
              className="flex w-full justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-600"
            >
              ← Cancel and return
            </Link>

          </aside>

        </div>

      </section>

      <style>{`

        .toolbar-button {
          height: 40px;
          min-width: 40px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 0 12px;
          color: #334155;
          transition: all 0.2s ease;
        }

        .toolbar-button:hover {
          border-color: #c4b5fd;
          background: #f5f3ff;
          color: #6d28d9;
        }

        .article-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }

        .article-editor h1 {
          margin: 2.5rem 0 1.25rem;
          font-size: 2.7rem;
          line-height: 1.1;
          font-weight: 900;
          color: #0f172a;
        }

        .article-editor h2 {
          margin: 2.2rem 0 1rem;
          font-size: 2rem;
          line-height: 1.2;
          font-weight: 900;
          color: #0f172a;
        }

        .article-editor h3 {
          margin: 1.8rem 0 0.8rem;
          font-size: 1.45rem;
          line-height: 1.3;
          font-weight: 800;
          color: #1e293b;
        }

        .article-editor p {
          margin: 1.25rem 0;
        }

        .article-editor ul {
          margin: 1.25rem 0;
          list-style: disc;
          padding-left: 2rem;
        }

        .article-editor ol {
          margin: 1.25rem 0;
          list-style: decimal;
          padding-left: 2rem;
        }

        .article-editor li {
          margin: 0.5rem 0;
        }

        .article-editor blockquote {
          margin: 2rem 0;
          border-left: 5px solid #7c3aed;
          border-radius: 0 16px 16px 0;
          background: #f5f3ff;
          padding: 1.25rem 1.5rem;
          font-size: 1.2rem;
          font-style: italic;
          font-weight: 600;
          color: #4c1d95;
        }

        .article-editor a {
          color: #2563eb;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

      `}</style>

    </main>
  );
}