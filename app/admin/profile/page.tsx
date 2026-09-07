"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Author = {
  id: number;
  name: string | null;
  username: string | null;
  bio: string | null;
  image_url: string | null;
};

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [authorId, setAuthorId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("authors")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const author = data as Author;

        setAuthorId(author.id);
        setName(author.name || "");
        setUsername(author.username || "");
        setBio(author.bio || "");
        setImageUrl(author.image_url || "");
      }
    } catch (error) {
      console.error("Profile load error:", error);

      alert(
        error instanceof Error
          ? `Could not load profile: ${error.message}`
          : "Could not load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    setSaving(true);

    try {
      const profileData = {
        name: name.trim(),
        username: username.trim() || null,
        bio: bio.trim() || null,
        image_url: imageUrl.trim() || null,
      };

      if (authorId) {
        const { error } = await supabase
          .from("authors")
          .update(profileData)
          .eq("id", authorId);

        if (error) {
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from("authors")
          .insert(profileData)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setAuthorId(data.id);
      }

      alert("Profile saved successfully! 🎉");
    } catch (error) {
      console.error("Profile save error:", error);

      alert(
        error instanceof Error
          ? `Could not save profile: ${error.message}`
          : "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const fileExtension = file.name.split(".").pop();

      const fileName = `profile-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExtension}`;

      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("author-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("author-images")
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);

      alert("Profile image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);

      alert(
        error instanceof Error
          ? `Image upload failed: ${error.message}`
          : "Could not upload the image."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage() {
    if (!imageUrl) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile image?"
    );

    if (confirmed) {
      setImageUrl("");
    }
  }

  function getInitials() {
    if (!name.trim()) return "G";

    return name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-purple-50 to-blue-100">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-pink-300/25 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 w-64 rounded-xl bg-slate-200" />
            <div className="h-64 rounded-3xl bg-slate-200" />
            <div className="h-[500px] rounded-3xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-purple-50 to-blue-100 text-slate-900">

      {/* PREMIUM GLOBALYN BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />

        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-3xl" />

        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-pink-300/25 blur-3xl" />

        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

      </div>

      {/* ALL EXISTING PAGE CONTENT */}

      <div className="relative z-10">

        {/* HEADER */}

        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">

            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 text-lg font-black text-white shadow-lg">
                G
              </div>

              <div>
                <p className="text-lg font-black tracking-tight text-slate-950">
                  GLOBALYN
                </p>

                <p className="text-xs font-medium text-purple-500">
                  Admin Profile
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                ← Dashboard
              </Link>

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>

          </div>
        </header>

        {/* HERO */}

        <section className="border-b border-slate-200 bg-white/70">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">

            <p className="inline-flex rounded-full border border-purple-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-purple-600 shadow-sm">
              👤 My Profile
            </p>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Manage your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                GLOBALYN profile.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
              Update your author information, biography and profile photo.
              Your profile can represent you across your GLOBALYN content.
            </p>

          </div>
        </section>

        {/* MAIN CONTENT */}

        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">

            {/* PROFILE FORM */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">

              <div className="border-b border-slate-100 pb-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">
                  Profile Information
                </p>

                <h2 className="mt-3 text-2xl font-black text-slate-950">
                  Your details
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep your author profile up to date.
                </p>
              </div>

              {/* NAME */}

              <div className="mt-8">
                <label className="block text-sm font-bold text-slate-800">
                  Full Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-4 text-base font-semibold outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {/* USERNAME */}

              <div className="mt-7">
                <label className="block text-sm font-bold text-slate-800">
                  Username
                </label>

                <div className="mt-3 flex overflow-hidden rounded-xl border border-slate-300">
                  <span className="flex items-center border-r border-slate-200 bg-purple-50 px-4 font-bold text-purple-600">
                    @
                  </span>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/\s/g, ""))
                    }
                    placeholder="yourusername"
                    className="min-w-0 flex-1 px-4 py-4 font-medium outline-none"
                  />
                </div>
              </div>

              {/* BIO */}

              <div className="mt-7">
                <label className="block text-sm font-bold text-slate-800">
                  Biography
                </label>

                <p className="mt-2 text-sm text-slate-500">
                  Tell readers a little about yourself.
                </p>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={6}
                  placeholder="Write something about yourself..."
                  className="mt-3 w-full resize-none rounded-xl border border-slate-300 px-4 py-4 leading-7 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {bio.length} characters
                </p>
              </div>

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="mt-8 w-full rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving Profile..." : "💾 Save Profile"}
              </button>

            </div>

            {/* SIDEBAR */}

            <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">

              {/* PROFILE PHOTO */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">

                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">
                  Profile Photo
                </p>

                <h2 className="mt-3 text-xl font-black">
                  Your picture
                </h2>

                <div className="mt-6 flex justify-center">

                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name || "Profile"}
                      className="h-40 w-40 rounded-full border-4 border-white object-cover shadow-xl ring-4 ring-purple-100"
                    />
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-5xl font-black text-white shadow-xl">
                      {getInitials()}
                    </div>
                  )}

                </div>

                <label className="mt-7 flex cursor-pointer items-center justify-center rounded-xl border border-purple-200 bg-purple-50 px-4 py-3.5 text-sm font-bold text-purple-700 transition hover:bg-purple-100">

                  {uploading ? "Uploading..." : "📷 Upload Photo"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />

                </label>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                  >
                    🗑 Remove Photo
                  </button>
                )}

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  JPG, PNG or WEBP. Maximum size 5 MB.
                </p>

              </div>

              {/* PROFILE PREVIEW */}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">

                <div className="h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />

                <div className="relative px-6 pb-7">

                  <div className="-mt-12">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name || "Profile preview"}
                        className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-950 text-3xl font-black text-white shadow-lg">
                        {getInitials()}
                      </div>
                    )}

                  </div>

                  <h3 className="mt-4 text-xl font-black text-slate-950">
                    {name || "Your Name"}
                  </h3>

                  {username && (
                    <p className="mt-1 text-sm font-semibold text-purple-600">
                      @{username.replace(/^@/, "")}
                    </p>
                  )}

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {bio || "Your biography will appear here."}
                  </p>

                </div>

              </div>

              {/* BACK */}

              <Link
                href="/admin"
                className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-sm transition hover:text-slate-950"
              >
                ← Back to Dashboard
              </Link>

            </aside>

          </div>

        </section>

      </div>

    </main>
  );
}