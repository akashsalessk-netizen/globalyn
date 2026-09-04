"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: number;
  name: string;
  created_at: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  async function loadCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      alert("Could not load categories: " + error.message);
      setLoading(false);
      return;
    }

    setCategories(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();

    const categoryName = name.trim();

    if (!categoryName) {
      alert("Please enter a category name.");
      return;
    }

    const alreadyExists = categories.some(
      (category) =>
        category.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (alreadyExists) {
      alert("This category already exists.");
      return;
    }

    setAdding(true);

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: categoryName,
      })
      .select()
      .single();

    setAdding(false);

    if (error) {
      alert("Could not add category: " + error.message);
      return;
    }

    if (data) {
      setCategories((current) =>
        [...current, data].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    }

    setName("");

    alert("Category added successfully!");
  }

  async function deleteCategory(id: number, categoryName: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Could not delete category: " + error.message);
      return;
    }

    setCategories((current) =>
      current.filter((category) => category.id !== id)
    );

    alert("Category deleted successfully!");
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              Blog Admin
            </h1>

            <p className="text-sm text-gray-500">
              Manage your blog categories
            </p>
          </div>

          <Link
            href="/admin"
            className="text-sm font-semibold"
          >
            ← Back to Dashboard
          </Link>

        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-4xl px-6 py-10">

        {/* Page heading */}
        <div>
          <h2 className="text-3xl font-bold">
            Categories
          </h2>

          <p className="mt-2 text-gray-500">
            Create and manage categories for your articles.
          </p>
        </div>

        {/* Add Category */}
        <form
          onSubmit={addCategory}
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
        >

          <h3 className="text-lg font-bold">
            Add New Category
          </h3>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-black"
            />

            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Category"}
            </button>

          </div>

        </form>

        {/* Category List */}
        <div className="mt-8 rounded-2xl bg-white shadow-sm">

          <div className="border-b px-6 py-5">
            <h3 className="text-lg font-bold">
              All Categories
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {categories.length}{" "}
              {categories.length === 1
                ? "category"
                : "categories"}
            </p>
          </div>

          {loading ? (

            <div className="px-6 py-10 text-center">
              <p className="text-gray-500">
                Loading categories...
              </p>
            </div>

          ) : categories.length === 0 ? (

            <div className="px-6 py-10 text-center">
              <p className="text-gray-500">
                No categories found.
              </p>
            </div>

          ) : (

            <div className="divide-y">

              {categories.map((category) => (

                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 px-6 py-5"
                >

                  <div>
                    <p className="font-semibold">
                      {category.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Created{" "}
                      {new Date(
                        category.created_at
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteCategory(
                        category.id,
                        category.name
                      )
                    }
                    className="rounded-lg border px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-4">

          <Link
            href="/admin/new"
            className="rounded-lg bg-black px-5 py-3 font-semibold text-white"
          >
            + New Article
          </Link>

          <Link
            href="/admin"
            className="rounded-lg border bg-white px-5 py-3 font-semibold"
          >
            Dashboard
          </Link>

        </div>

      </section>

    </main>
  );
}