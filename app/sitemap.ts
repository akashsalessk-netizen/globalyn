import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://globalyn.vercel.app";

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, created_at")
    .eq("status", "published");

  const articleUrls =
    articles?.map((article) => ({
      url: `${siteUrl}/blog/${article.slug}`,
      lastModified: article.created_at || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || [];

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...articleUrls,
  ];
}