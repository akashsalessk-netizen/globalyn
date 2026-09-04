"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
};

const TEXT_COLORS = [
  "#000000",
  "#1F2937",
  "#374151",
  "#6B7280",
  "#9CA3AF",

  "#DC2626",
  "#EF4444",
  "#F97316",
  "#EA580C",
  "#F59E0B",
  "#CA8A04",

  "#84CC16",
  "#16A34A",
  "#22C55E",
  "#059669",

  "#14B8A6",
  "#06B6D4",
  "#0891B2",

  "#3B82F6",
  "#2563EB",
  "#1D4ED8",

  "#4F46E5",
  "#6366F1",
  "#7C3AED",
  "#9333EA",

  "#C026D3",
  "#DB2777",
  "#E11D48",
];

const HIGHLIGHT_COLORS = [
  "#FEF3C7",
  "#FDE68A",
  "#FACC15",

  "#FECACA",
  "#FCA5A5",

  "#FED7AA",
  "#FDBA74",

  "#DCFCE7",
  "#BBF7D0",
  "#86EFAC",

  "#CCFBF1",
  "#99F6E4",

  "#CFFAFE",
  "#A5F3FC",

  "#DBEAFE",
  "#BFDBFE",

  "#E0E7FF",
  "#C7D2FE",

  "#F3E8FF",
  "#DDD6FE",

  "#FAE8FF",
  "#F5D0FE",

  "#FCE7F3",
  "#FBCFE8",
];

const FONT_SIZES = [
  {
    label: "Small",
    value: "14px",
  },
  {
    label: "Normal",
    value: "16px",
  },
  {
    label: "Medium",
    value: "18px",
  },
  {
    label: "Large",
    value: "22px",
  },
  {
    label: "Extra Large",
    value: "26px",
  },
  {
    label: "Huge",
    value: "32px",
  },
];

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,

      TextStyle,

      Color,

      Highlight.configure({
        multicolor: true,
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],

    content,

    immediatelyRender: false,

    editorProps: {
      attributes: {
        class:
          "min-h-[600px] w-full px-6 py-6 text-base leading-8 text-slate-700 outline-none",
      },
    },

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (content !== editor.getHTML()) {
  editor.commands.setContent(content || "<p></p>");
}
}, [content, editor]);

  function addLink() {
    if (!editor) return;

    const previousUrl =
      editor.getAttributes("link").href || "";

    const url = window.prompt(
      "Enter URL:",
      previousUrl
    );

    if (url === null) return;

    if (url.trim() === "") {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    const finalUrl =
      url.startsWith("http://") ||
      url.startsWith("https://")
        ? url
        : `https://${url}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: finalUrl,
      })
      .run();
  }

  function setFontSize(size: string) {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .setMark("textStyle", {
        fontSize: size,
      })
      .run();
  }

  function resetFontSize() {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .setMark("textStyle", {
        fontSize: null,
      })
      .run();
  }

  if (!editor) {
    return (
      <div className="min-h-[600px] animate-pulse rounded-xl bg-slate-100" />
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">

      {/* TOOLBAR */}

      <div className="space-y-4 border-b border-slate-200 bg-slate-50 p-4">

        {/* MAIN TOOLS */}

        <div className="flex flex-wrap items-center gap-2">

          {/* BOLD */}

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleBold().run()
            }
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              editor.isActive("bold")
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-100"
            }`}
          >
            B
          </button>

          {/* ITALIC */}

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleItalic().run()
            }
            className={`rounded-lg px-3 py-2 text-sm font-bold italic transition ${
              editor.isActive("italic")
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-100"
            }`}
          >
            I
          </button>

          {/* H2 */}

          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 2,
                })
                .run()
            }
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              editor.isActive("heading", {
                level: 2,
              })
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-100"
            }`}
          >
            H2
          </button>

          {/* H3 */}

          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 3,
                })
                .run()
            }
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              editor.isActive("heading", {
                level: 3,
              })
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-100"
            }`}
          >
            H3
          </button>

          {/* TEXT SIZE */}

          <select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                setFontSize(event.target.value);
              }
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none hover:bg-slate-100"
          >
            <option value="">
              🔤 Text Size
            </option>

            {FONT_SIZES.map((size) => (
              <option
                key={size.value}
                value={size.value}
              >
                {size.label}
              </option>
            ))}
          </select>

          {/* BULLET LIST */}

          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              editor.isActive("bulletList")
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-100"
            }`}
          >
            • List
          </button>

          {/* NUMBER LIST */}

          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              editor.isActive("orderedList")
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-100"
            }`}
          >
            1. List
          </button>

          {/* QUOTE */}

          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBlockquote()
                .run()
            }
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              editor.isActive("blockquote")
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-100"
            }`}
          >
            Quote
          </button>

          {/* LINK */}

          <button
            type="button"
            onClick={addLink}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              editor.isActive("link")
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-100"
            }`}
          >
            🔗 Link
          </button>

          {/* CLEAR */}

          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .clearNodes()
                .unsetAllMarks()
                .run()
            }
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            Clear
          </button>

          {/* UNDO */}

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().undo().run()
            }
            disabled={!editor.can().undo()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold transition hover:bg-slate-100 disabled:opacity-40"
          >
            ↶
          </button>

          {/* REDO */}

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().redo().run()
            }
            disabled={!editor.can().redo()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold transition hover:bg-slate-100 disabled:opacity-40"
          >
            ↷
          </button>

        </div>

        {/* TEXT COLORS */}

        <div className="border-t border-slate-200 pt-3">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              🎨 Text Color
            </span>

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .unsetColor()
                  .run()
              }
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-bold hover:bg-slate-100"
            >
              Reset
            </button>

          </div>

          <div className="flex flex-wrap gap-2">

            {TEXT_COLORS.map((color) => (

              <button
                key={color}
                type="button"
                title={color}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setColor(color)
                    .run()
                }
                className="h-8 w-8 rounded-full border-2 border-white shadow-md transition hover:scale-110 hover:ring-2 hover:ring-slate-400"
                style={{
                  backgroundColor: color,
                }}
              />

            ))}

          </div>

        </div>

        {/* HIGHLIGHT COLORS */}

        <div className="border-t border-slate-200 pt-3">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              🖍️ Highlight Color
            </span>

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .unsetHighlight()
                  .run()
              }
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-bold hover:bg-slate-100"
            >
              Remove
            </button>

          </div>

          <div className="flex flex-wrap gap-2">

            {HIGHLIGHT_COLORS.map((color) => (

              <button
                key={color}
                type="button"
                title={color}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setHighlight({
                      color,
                    })
                    .run()
                }
                className="h-8 w-8 rounded-lg border border-slate-300 shadow-sm transition hover:scale-110 hover:ring-2 hover:ring-slate-400"
                style={{
                  backgroundColor: color,
                }}
              />

            ))}

          </div>

        </div>

      </div>

      {/* EDITOR */}

      <EditorContent editor={editor} />

    </div>
  );
}