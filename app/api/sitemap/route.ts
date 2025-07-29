import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get all generated links
    const { data: links } = await supabase
      .from("generated_links")
      .select("link_id, created_at")
      .order("created_at", { ascending: false })
      .limit(1000) // Limit for performance

    const baseUrl = "https://social-share-rust.vercel.app"

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${(links || [])
    .map(
      (link) => `
  <url>
    <loc>${baseUrl}/post/${link.link_id}</loc>
    <lastmod>${new Date(link.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join("")}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return new NextResponse("Error generating sitemap", { status: 500 })
  }
}
