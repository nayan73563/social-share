import type { MetadataRoute } from "next"
import { supabase } from "@/lib/supabase"
import { SITE_CONFIG } from "@/lib/config"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all generated links
  const { data: links } = await supabase
    .from("generated_links")
    .select("link_id, created_at")
    .order("created_at", { ascending: false })

  const postUrls = (links || []).map((link) => ({
    url: `${SITE_CONFIG.url}/post/${link.link_id}`,
    lastModified: new Date(link.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: SITE_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...postUrls,
  ]
}
