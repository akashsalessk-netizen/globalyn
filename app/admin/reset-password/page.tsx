"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">(
    "error"
  );

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (!password.trim() || !confirmPassword.trim()) {
      setMessageType("error");
      setMessage("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setMessageType("error");
      setMessage("Your password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessageType("error");
        setMessage(error.message);
        return;
      }

      setMessageType("success");
      setMessage(
        "Your password has been changed successfully! Redirecting to login..."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error);

      setMessageType("error");
      setMessage(
        "Something went wrong while changing your password. Please try again."
      );
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

        {/* RESET PASSWORD CARD */}

        <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-500">
              Secure Account
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Create a new password.
            </h1>

            <p className="mt-3 leading-7 text-slate-500">
              Choose a new secure password for your GLOBALYN Admin Studio
              account.
            </p>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleResetPassword}
            className="mt-8 space-y-5"
          >

            {/* NEW PASSWORD */}

            <div>
              <label className="block text-sm font-bold text-slate-800">
                New Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Use at least 6 characters.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label className="block text-sm font-bold text-slate-800">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* MESSAGE */}

            {message && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  messageType === "success"
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            {/* RESET BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating Password..." : "Reset Password →"}
            </button>

          </form>

          {/* BACK TO LOGIN */}

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">

            <Link
              href="/login"
              className="text-sm font-bold text-slate-500 transition hover:text-purple-600"
            >
              ← Back to Sign In
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