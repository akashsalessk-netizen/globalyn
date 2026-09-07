"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkRecoverySession() {
      try {
        /*
          Supabase password recovery links can contain tokens
          in the URL hash (#access_token=...).

          Supabase automatically detects these tokens and creates
          a session in the browser.
        */

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session) {
          setHasRecoverySession(true);
        } else {
          setMessage(
            "This password reset link is invalid, expired, or missing. Please request a new password reset link."
          );
        }
      } catch (error) {
        console.error("Recovery session error:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not verify your password reset link."
        );
      } finally {
        setCheckingSession(false);
      }
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setHasRecoverySession(true);
        setMessage("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!hasRecoverySession) {
      setMessage(
        "Your password recovery session is missing. Please request a new password reset link."
      );
      return;
    }

    if (!password.trim()) {
      setMessage("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Your password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);

      setMessage(
        "Your password has been changed successfully! Redirecting to sign in..."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }, 2500);
    } catch (error) {
      console.error("Reset password error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while resetting your password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-5">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-2xl font-black text-white shadow-xl">
            G
          </div>

          <p className="mt-5 text-sm font-bold text-white">
            Verifying your reset link...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-5 py-10">
      <div className="w-full max-w-md">

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

        <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-500">
              Secure Account Recovery
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Create a new password.
            </h1>

            <p className="mt-3 leading-7 text-slate-500">
              Choose a strong new password to secure your GLOBALYN Admin Studio account.
            </p>
          </div>

          {!hasRecoverySession ? (
            <div className="mt-8">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-600">
                ⚠️ {message || "Your password reset link is invalid or expired."}
              </div>

              <Link
                href="/admin/forgot-password"
                className="mt-5 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-5 py-4 text-sm font-black text-white shadow-lg"
              >
                Request New Reset Link →
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="mt-8 space-y-5"
            >

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
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Use at least 6 characters.
                </p>
              </div>

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
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    success
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {success ? "✅ " : "⚠️ "}
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Updating Password..."
                  : success
                  ? "Password Updated ✓"
                  : "Reset Password →"}
              </button>

            </form>
          )}

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <Link
              href="/admin/login"
              className="text-sm font-bold text-slate-500 transition hover:text-purple-600"
            >
              ← Back to Sign In
            </Link>
          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          GLOBALYN Admin Studio • Secure Password Reset
        </p>

      </div>
    </main>
  );
}