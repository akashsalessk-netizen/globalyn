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
  const [message, setMessage] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    async function handleRecovery() {
      try {
        // Supabase may return the recovery token in the URL hash
        const hash = window.location.hash;

        if (hash) {
          const hashParams = new URLSearchParams(
            hash.replace("#", "")
          );

          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              throw error;
            }

            // Remove tokens from the browser URL
            window.history.replaceState(
              {},
              document.title,
              "/admin/reset-password"
            );
          }
        }

        // Check whether the recovery session now exists
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session) {
          setSessionReady(true);
          setMessage("");
        } else {
          setMessage(
            "Your password recovery session is missing or expired. Please request a new password recovery link."
          );
        }
      } catch (error) {
        console.error("Recovery session error:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not verify your password recovery session."
        );
      } finally {
        setCheckingSession(false);
      }
    }

    handleRecovery();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN") &&
        session
      ) {
        setSessionReady(true);
        setMessage("");
        setCheckingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Recovery session missing. Please request a new password recovery link."
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      alert(
        "Password updated successfully! You can now sign in with your new password."
      );

      await supabase.auth.signOut();

      router.push("/admin/login");
    } catch (error) {
      console.error("Password reset error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update your password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-5">
        <div className="text-center text-white">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-purple-400" />

          <p className="mt-5 font-bold">
            Verifying password recovery link...
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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-500">
            Account Security
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Create a new password.
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            Choose a new secure password for your GLOBALYN admin account.
          </p>

          {message && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-600">
              {message}
            </div>
          )}

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
                disabled={!sessionReady}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm your new password"
                autoComplete="new-password"
                disabled={!sessionReady}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !sessionReady}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Updating Password..."
                : "Update Password →"}
            </button>
          </form>

          {!sessionReady && (
            <Link
              href="/admin/login"
              className="mt-6 block text-center text-sm font-bold text-purple-600"
            >
              ← Return to Login
            </Link>
          )}

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <Link
              href="/"
              className="text-sm font-bold text-slate-500 transition hover:text-purple-600"
            >
              ← Back to GLOBALYN
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}