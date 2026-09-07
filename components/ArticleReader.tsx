"use client";

import { useEffect, useState } from "react";

type ArticleReaderProps = {
children: React.ReactNode;
};

export default function ArticleReader({
children,
}: ArticleReaderProps) {
const [darkMode, setDarkMode] = useState(false);
const [mounted, setMounted] = useState(false);

useEffect(() => {
const savedTheme = localStorage.getItem(
"globalyn-reading-theme"
);

if (savedTheme === "dark") {
  setDarkMode(true);
}

setMounted(true);

}, []);

function toggleTheme() {
const newTheme = !darkMode;

setDarkMode(newTheme);

localStorage.setItem(
  "globalyn-reading-theme",
  newTheme ? "dark" : "light"
);

}

if (!mounted) {
return (
<div className="min-h-screen bg-white">
{children}
</div>
);
}

return (
<div
className={
darkMode
? "min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300"
: "min-h-screen bg-white text-slate-900 transition-colors duration-300"
}
>
<button
type="button"
onClick={toggleTheme}
className={
darkMode
? "fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl transition hover hover"
: "fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-2xl transition hover hover"
}
aria-label="Change reading mode"
>
{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>

  <div
    className={
      darkMode
        ? "article-dark-mode"
        : "article-light-mode"
    }
  >
    {children}
  </div>

  <style jsx global>{`
    .article-dark-mode header {
      background: rgba(2, 6, 23, 0.95) !important;
      border-color: #334155 !important;
    }

    .article-dark-mode footer {
      background: #020617 !important;
      border-color: #334155 !important;
    }

    .article-dark-mode section {
      border-color: #334155 !important;
    }

    .article-dark-mode .bg-white {
      background-color: #0f172a !important;
    }

    .article-dark-mode .bg-white\\/95 {
      background-color: rgba(15, 23, 42, 0.95) !important;
    }

    .article-dark-mode .bg-slate-50 {
      background-color: #0f172a !important;
    }

    .article-dark-mode .bg-purple-50 {
      background-color: #1e1b4b !important;
    }

    .article-dark-mode .text-slate-950,
    .article-dark-mode .text-slate-900,
    .article-dark-mode .text-slate-800 {
      color: #f8fafc !important;
    }

    .article-dark-mode .text-slate-700 {
      color: #e2e8f0 !important;
    }

    .article-dark-mode .text-slate-600,
    .article-dark-mode .text-slate-500 {
      color: #cbd5e1 !important;
    }

    .article-dark-mode .text-slate-400 {
      color: #94a3b8 !important;
    }

    .article-dark-mode .border-slate-200,
    .article-dark-mode .border-t,
    .article-dark-mode .border-b {
      border-color: #334155 !important;
    }

    .article-dark-mode .article-content {
      color: #e2e8f0 !important;
    }

    .article-dark-mode .article-content h1,
    .article-dark-mode .article-content h2,
    .article-dark-mode .article-content h3 {
      color: #ffffff !important;
    }

    .article-dark-mode .article-content blockquote {
      background-color: #1e293b !important;
      color: #e2e8f0 !important;
      border-color: #a855f7 !important;
    }

    .article-dark-mode .article-content a {
      color: #60a5fa !important;
    }
  `}</style>
</div>

);
}