import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://your-domain.com";

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, created_at")
    .eq("status", "published");

  const articleUrls =
    articles?.map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: article.created_at
        ? new Date(article.created_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    ...articleUrls,
  ];
}