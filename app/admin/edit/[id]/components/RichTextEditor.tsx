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
"#374151",
"#dc2626",
"#ea580c",
"#ca8a04",
"#16a34a",
"#0891b2",
"#2563eb",
"#4f46e5",
"#7c3aed",
"#9333ea",
"#db2777",
];

const HIGHLIGHT_COLORS = [
"#fef08a",
"#fed7aa",
"#fecaca",
"#bbf7d0",
"#a7f3d0",
"#a5f3fc",
"#bfdbfe",
"#ddd6fe",
"#f5d0fe",
"#fbcfe8",
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
      "min-h-[500px] w-full p-6 text-lg leading-8 text-slate-700 outline-none",
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

const url = window.prompt("Enter website URL");

if (!url) return;

const finalUrl =
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;

editor
  .chain()
  .focus()
  .setLink({
    href: finalUrl,
  })
  .run();

}

if (!editor) {
return (
<div className="min-h-[500px] animate-pulse rounded-xl bg-slate-100" />
);
}

return (
<div className="mt-6 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg">
<div className="border-b border-slate-200 bg-slate-50 p-4">
<div className="flex flex-wrap gap-2">
<button
type="button"
onClick={() => editor.chain().focus().toggleBold().run()}
className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover"
>
B
</button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="rounded-lg bg-purple-600 px-4 py-2 font-bold italic text-white hover:bg-purple-700"
      >
        I
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className="rounded-lg bg-pink-600 px-4 py-2 font-bold text-white hover:bg-pink-700"
      >
        H1
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className="rounded-lg bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
      >
        H2
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
      >
        H3
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
      >
        • List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="rounded-lg bg-teal-600 px-4 py-2 font-bold text-white hover:bg-teal-700"
      >
        1. List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-600"
      >
        Quote
      </button>

      <button
        type="button"
        onClick={addLink}
        className="rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700"
      >
        🔗 Link
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
      >
        Clear
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="rounded-lg bg-slate-700 px-4 py-2 font-bold text-white hover:bg-slate-800 disabled:opacity-40"
      >
        ↶
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="rounded-lg bg-slate-700 px-4 py-2 font-bold text-white hover:bg-slate-800 disabled:opacity-40"
      >
        ↷
      </button>
    </div>

    <div className="mt-4 rounded-xl border border-blue-100 bg-white p-4">
      <p className="mb-3 font-bold text-blue-700">
        🎨 Text Color
      </p>

      <div className="flex flex-wrap gap-3">
        {TEXT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() =>
              editor.chain().focus().setColor(color).run()
            }
            className="h-9 w-9 rounded-full border-2 border-slate-300 shadow transition hover:scale-110"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().unsetColor().run()
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
        >
          Reset
        </button>
      </div>
    </div>

    <div className="mt-4 rounded-xl border border-pink-100 bg-white p-4">
      <p className="mb-3 font-bold text-pink-700">
        🖍️ Highlight
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
                .setHighlight({ color })
                .run()
            }
            className="h-9 w-9 rounded-lg border border-slate-300 shadow transition hover:scale-110"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().unsetHighlight().run()
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
        >
          Remove
        </button>
      </div>
    </div>
  </div>

  <EditorContent editor={editor} />
</div>

);
}