"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

async function handleLogin(e: React.FormEvent) {
e.preventDefault();

setMessage("");

if (!email.trim() || !password.trim()) {
  setMessage("Please enter your email and password.");
  return;
}

setLoading(true);

try {
  const { error } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

  if (error) {
    setMessage(error.message);
    return;
  }

  router.push("/admin");
  router.refresh();
} catch (error) {
  console.error("Login error:", error);

  setMessage("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}

}

return (
<main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-5 py-10">

  <div className="w-full max-w-md">

    {/* LOGO */}

    <Link
      href="/"
      className="mb-8 flex items-center justify-center gap-3"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-xl font-black text-white shadow-xl">
        G
      </div>

      <div>
        <p className="text-xl font-black tracking-tight text-white">
          GLOBALYN
        </p>

        <p className="text-xs font-medium text-purple-300">
          Admin Studio
        </p>
      </div>
    </Link>

    {/* LOGIN CARD */}

    <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9">

      <div>

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-500">
          Welcome Back
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Sign in to GLOBALYN.
        </h1>

        <p className="mt-3 leading-7 text-slate-500">
          Sign in to access your publishing dashboard and manage your articles.
        </p>

      </div>

      {/* FORM */}

      <form
        onSubmit={handleLogin}
        className="mt-8 space-y-5"
      >

        {/* EMAIL */}

        <div>

          <label className="block text-sm font-bold text-slate-800">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
          />

        </div>

        {/* PASSWORD */}

        <div>

          <label className="block text-sm font-bold text-slate-800">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
          />

        </div>

        {/* ERROR MESSAGE */}

        {message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {message}
          </div>
        )}

        {/* LOGIN BUTTON */}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

      </form>

      {/* BACK */}

      <div className="mt-7 border-t border-slate-100 pt-6 text-center">

        <Link
          href="/"
          className="text-sm font-bold text-slate-500 transition hover:text-purple-600"
        >
          ← Back to GLOBALYN
        </Link>

      </div>

    </div>

    <p className="mt-6 text-center text-xs text-slate-400">
      GLOBALYN Admin Studio • Secure Access
    </p>

  </div>

</main>

);
}