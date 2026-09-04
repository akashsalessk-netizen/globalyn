"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";

import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";

type RichTextEditorProps = {
content: string;
onChange: (html: string) => void;
};

const FontSize = Extension.create({
name: "fontSize",

addGlobalAttributes() {
return [
{
types: ["textStyle"],

    attributes: {
      fontSize: {
        default: null,

        parseHTML: (element) => element.style.fontSize || null,

        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }

          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    },
  },
];

},
});

const FONT_SIZES = [
"12px",
"14px",
"16px",
"18px",
"20px",
"22px",
"24px",
"26px",
"28px",
"32px",
"36px",
"40px",
"48px",
"56px",
"64px",
];

const TEXT_COLORS = [
"#000000",
"#374151",
"#6B7280",
"#DC2626",
"#EA580C",
"#CA8A04",
"#16A34A",
"#059669",
"#0891B2",
"#2563EB",
"#4F46E5",
"#7C3AED",
"#9333EA",
"#C026D3",
"#DB2777",
"#E11D48",
];

const HIGHLIGHT_COLORS = [
"#FECACA",
"#FED7AA",
"#FEF08A",
"#BBF7D0",
"#A7F3D0",
"#A5F3FC",
"#BFDBFE",
"#C7D2FE",
"#DDD6FE",
"#F5D0FE",
"#FBCFE8",
];

export default function RichTextEditor({
content,
onChange,
}: RichTextEditorProps) {
const [mounted, setMounted] = useState(false);

useEffect(() => {
setMounted(true);
}, []);

const editor = useEditor({
extensions: [
StarterKit.configure({
heading: {
levels: [1, 2, 3],
},
}),

  TextStyle,

  FontSize,

  Color,

  Highlight.configure({
    multicolor: true,
  }),

  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    defaultProtocol: "https",
  }),
],

content: content || "<p></p>",

immediatelyRender: false,

editorProps: {
  attributes: {
    class:
      "min-h-[600px] w-full px-6 py-6 text-base leading-8 text-slate-700 outline-none focus:outline-none",
  },
},

onUpdate: ({ editor }) => {
  onChange(editor.getHTML());
},

});

useEffect(() => {
if (!editor) return;

const currentHTML = editor.getHTML();

if (content !== currentHTML) {
  editor.commands.setContent(content || "<p></p>");
}

}, [content, editor]);

function addLink() {
if (!editor) return;

const previousUrl =
  editor.getAttributes("link").href || "";

const url = window.prompt(
  "Enter website URL:",
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

function getButtonClass(active: boolean, color: string) {
  if (active) {
    return color + " ring-4 ring-slate-300";
  }

  return color + " hover:scale-105";
}

if (!mounted || !editor) {
return (
<div className="min-h-[600px] animate-pulse rounded-2xl bg-slate-100" />
);
}

return (
<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

  {/* TOOLBAR */}
  <div className="space-y-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4">

    {/* MAIN BUTTONS */}
    <div className="flex flex-wrap items-center gap-2">

      {/* BOLD */}
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleBold().run()
        }
        className={`rounded-xl px-4 py-2 font-bold text-white transition ${getButtonClass(
          editor.isActive("bold"),
          "bg-blue-600"
        )}`}
      >
        B
      </button>

      {/* ITALIC */}
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleItalic().run()
        }
        className={`rounded-xl px-4 py-2 font-bold italic text-white transition ${getButtonClass(
          editor.isActive("italic"),
          "bg-purple-600"
        )}`}
      >
        I
      </button>

      {/* H1 */}
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: 1 })
            .run()
        }
        className={`rounded-xl px-4 py-2 font-bold text-white transition ${getButtonClass(
          editor.isActive("heading", {
            level: 1,
          }),
          "bg-pink-600"
        )}`}
      >
        H1
      </button>

      {/* H2 */}
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: 2 })
            .run()
        }
        className={`rounded-xl px-4 py-2 font-bold text-white transition ${getButtonClass(
          editor.isActive("heading", {
            level: 2,
          }),
          "bg-orange-500"
        )}`}
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
            .toggleHeading({ level: 3 })
            .run()
        }
        className={`rounded-xl px-4 py-2 font-bold text-white transition ${getButtonClass(
          editor.isActive("heading", {
            level: 3,
          }),
          "bg-green-600"
        )}`}
      >
        H3
      </button>

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
        className={`rounded-xl px-4 py-2 font-bold text-white transition ${getButtonClass(
          editor.isActive("bulletList"),
          "bg-emerald-600"
        )}`}
      >
        • List
      </button>

      {/* ORDERED LIST */}
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleOrderedList()
            .run()
        }
        className={`rounded-xl px-4 py-2 font-bold text-white transition ${getButtonClass(
          editor.isActive("orderedList"),
          "bg-teal-600"
        )}`}
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
        className={`rounded-xl px-4 py-2 font-bold text-white transition ${getButtonClass(
          editor.isActive("blockquote"),
          "bg-yellow-500"
        )}`}
      >
        Quote
      </button>

      {/* LINK */}
      <button
        type="button"
        onClick={addLink}
        className="rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white transition hover:scale-105 hover:bg-cyan-700"
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
        className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition hover:scale-105 hover:bg-red-700"
      >
        Clear
      </button>

      {/* UNDO */}
      <button
        type="button"
        disabled={!editor.can().undo()}
        onClick={() =>
          editor.chain().focus().undo().run()
        }
        className="rounded-xl bg-slate-700 px-4 py-2 font-bold text-white transition hover:scale-105 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ↶ Undo
      </button>

      {/* REDO */}
      <button
        type="button"
        disabled={!editor.can().redo()}
        onClick={() =>
          editor.chain().focus().redo().run()
        }
        className="rounded-xl bg-slate-700 px-4 py-2 font-bold text-white transition hover:scale-105 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ↷ Redo
      </button>

    </div>

    {/* FONT SIZE */}
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4">

      <p className="font-bold text-purple-700">
        🔤 Font Size
      </p>

      <select
        value={
          editor.getAttributes("textStyle").fontSize || ""
        }
        onChange={(event) => {
          if (event.target.value) {
            setFontSize(event.target.value);
          }
        }}
        className="rounded-xl border border-purple-300 bg-white px-4 py-2 font-bold text-purple-700 outline-none"
      >
        <option value="">Select Size</option>

        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size.replace("px", "")} px
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={resetFontSize}
        className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-600 transition hover:bg-purple-100"
      >
        Reset Size
      </button>

    </div>

    {/* TEXT COLORS */}
    <div className="rounded-2xl bg-white p-4">

      <p className="mb-3 font-bold text-blue-700">
        🎨 Text Color
      </p>

      <div className="flex flex-wrap gap-3">

        {TEXT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .setColor(color)
                .run()
            }
            className="h-9 w-9 rounded-full border-2 border-slate-300 shadow transition hover:scale-110"
            style={{
              backgroundColor: color,
            }}
            aria-label={`Set text color ${color}`}
          />
        ))}

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .unsetColor()
              .run()
          }
          className="rounded-xl bg-slate-200 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-300"
        >
          Reset
        </button>

      </div>

    </div>

    {/* HIGHLIGHT COLORS */}
    <div className="rounded-2xl bg-white p-4">

      <p className="mb-3 font-bold text-pink-700">
        🖍️ Highlight Color
      </p>

      <div className="flex flex-wrap gap-3">

        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .setHighlight({
                  color,
                })
                .run()
            }
            className="h-9 w-9 rounded-lg border border-slate-300 shadow transition hover:scale-110"
            style={{
              backgroundColor: color,
            }}
            aria-label={`Set highlight color ${color}`}
          />
        ))}

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .unsetHighlight()
              .run()
          }
          className="rounded-xl bg-slate-200 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-300"
        >
          Remove
        </button>

      </div>

    </div>

  </div>

  {/* EDITOR */}
  <EditorContent editor={editor} />

</div>

);
}