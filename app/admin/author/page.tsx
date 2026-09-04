"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Author = {
id: number;
name: string;
username: string | null;
bio: string | null;
image_url: string | null;
};

export default function AuthorProfilePage() {
const fileInputRef = useRef<HTMLInputElement>(null);

const [authorId, setAuthorId] = useState<number | null>(null);
const [name, setName] = useState("");
const [username, setUsername] = useState("");
const [bio, setBio] = useState("");
const [imageUrl, setImageUrl] = useState("");

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [uploading, setUploading] = useState(false);

useEffect(() => {
async function loadAuthor() {
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
    console.error("Load author error:", error);
    alert("Could not load author profile.");
  } finally {
    setLoading(false);
  }
}

loadAuthor();

}, []);

async function handlePhotoUpload(
event: React.ChangeEvent<HTMLInputElement>
) {
const file = event.target.files?.[0];

if (!file) return;

if (!file.type.startsWith("image/")) {
  alert("Please select a valid image file.");
  return;
}

if (file.size > 5 * 1024 * 1024) {
  alert("Profile photo must be smaller than 5 MB.");
  return;
}

setUploading(true);

try {
  const extension =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  const fileName = `profile-${Date.now()}.${extension}`;

  const filePath = `authors/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("author-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Photo upload failed: ${uploadError.message}`
    );
  }

  const { data } = supabase.storage
    .from("author-images")
    .getPublicUrl(filePath);

  setImageUrl(data.publicUrl);

  alert(
    "📸 Profile photo uploaded successfully! Click Save Profile to keep it."
  );
} catch (error) {
  console.error("Profile photo upload error:", error);

  alert(
    error instanceof Error
      ? error.message
      : "Could not upload profile photo."
  );
} finally {
  setUploading(false);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
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
    image_url: imageUrl || null,
    updated_at: new Date().toISOString(),
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

  alert("🎉 Author profile saved successfully!");
} catch (error) {
  console.error("Save author error:", error);

  alert(
    `Could not save profile: ${
      error instanceof Error
        ? error.message
        : JSON.stringify(error)
    }`
  );
} finally {
  setSaving(false);
}

}

async function removeImage() {
if (!imageUrl) return;

const confirmed = window.confirm(
  "Are you sure you want to remove your profile photo?"
);

if (!confirmed) return;

setImageUrl("");

}

if (loading) {
return (
<main className="min-h-screen bg-slate-50">
<div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
<div className="animate-pulse space-y-6">
<div className="h-12 w-64 rounded-xl bg-slate-200" />
<div className="h-[600px] rounded-3xl bg-slate-200" />
</div>
</div>
</main>
);
}

return (
<main className="min-h-screen bg-slate-50 text-slate-900">
<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
<div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
<Link href="/admin" className="flex items-center gap-3">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-lg font-black text-white shadow-lg">
G
</div>

        <div>
          <p className="font-black tracking-tight">
            GLOBALYN
          </p>

          <p className="text-xs text-slate-400">
            Author Profile Settings
          </p>
        </div>
      </Link>

      <Link
        href="/admin"
        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
      >
        ← Dashboard
      </Link>
    </div>
  </header>

  <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-sm font-bold uppercase tracking-widest text-purple-600">
        GLOBALYN Author
      </p>

      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
        Your Author Profile
      </h1>

      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
        Manage your name, username, biography and profile photo.
        You can update everything anytime.
      </p>
    </div>
  </section>

  <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Profile Preview
        </p>

        <div className="mt-6 flex flex-col items-center text-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name || "Author"}
              className="h-32 w-32 rounded-full border-4 border-purple-100 object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-5xl font-black text-white shadow-lg">
              {name
                ? name.charAt(0).toUpperCase()
                : "G"}
            </div>
          )}

          <h2 className="mt-5 text-xl font-black">
            {name || "Your Name"}
          </h2>

          {username && (
            <p className="mt-1 text-sm font-semibold text-purple-600">
              {username}
            </p>
          )}

          {bio && (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {bio}
            </p>
          )}
        </div>
      </aside>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-black">
            Profile Information
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Update your GLOBALYN author information and photo.
          </p>
        </div>

        <div className="mt-7">
          <label className="block text-sm font-bold">
            Full Name *
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
          />
        </div>

        <div className="mt-7">
          <label className="block text-sm font-bold">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@your_username"
            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
          />
        </div>

        <div className="mt-7">
          <label className="block text-sm font-bold">
            Biography
          </label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            placeholder="Write something about yourself..."
            className="mt-3 w-full resize-none rounded-xl border border-slate-300 px-4 py-3.5 leading-7 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
          />
        </div>

        {/* PROFILE PHOTO */}
        <div className="mt-8 border-t border-slate-100 pt-8">
          <h3 className="text-xl font-black">
            Profile Photo
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Upload a profile photo directly from your computer.
            Maximum file size: 5 MB.
          </p>

          {imageUrl && (
            <div className="mt-5 flex items-center gap-5">
              <img
                src={imageUrl}
                alt="Profile preview"
                className="h-24 w-24 rounded-full border-4 border-purple-100 object-cover shadow-md"
              />

              <button
                type="button"
                onClick={removeImage}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                🗑 Remove Photo
              </button>
            </div>
          )}

          <div className="mt-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading
                ? "Uploading Photo..."
                : imageUrl
                ? "📸 Change Profile Photo"
                : "📸 Upload Profile Photo"}
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-100 pt-7">
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving || uploading}
            className="rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "💾 Save Profile"}
          </button>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  </section>
</main>

);
}