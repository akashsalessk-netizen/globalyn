"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  // Pages that can be accessed without logging in
  const publicAdminPages = [
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ];

  const isPublicPage = publicAdminPages.includes(pathname);

  useEffect(() => {
    // Do not protect login and password pages
    if (isPublicPage) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function checkAuthentication() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        // User is not logged in
        if (!session) {
          router.replace("/admin/login");
          return;
        }

        // User is logged in
        setLoading(false);
      } catch (error) {
        console.error("Authentication check error:", error);

        if (isMounted) {
          router.replace("/admin/login");
        }
      }
    }

    checkAuthentication();

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isPublicPage, router]);

  // Public pages like Login / Forgot Password
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Loading screen while checking authentication
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-5">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-2xl font-black text-white shadow-xl">
            G
          </div>

          <h2 className="mt-6 text-xl font-black text-slate-900">
            GLOBALYN
          </h2>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Checking secure access...
          </p>
        </div>
      </main>
    );
  }

  // Logged-in user can access admin pages
  return <>{children}</>;
}