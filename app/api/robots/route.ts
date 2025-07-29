import { NextResponse } from "next/server"

export async function GET() {
  const robots = `User-agent: *
Allow: /

User-agent: facebookexternalhit
Allow: /post/

User-agent: Twitterbot
Allow: /post/

User-agent: LinkedInBot
Allow: /post/

User-agent: WhatsApp
Allow: /post/

User-agent: TelegramBot
Allow: /post/

User-agent: Discordbot
Allow: /post/

Sitemap: https://social-share-rust.vercel.app/sitemap.xml`

  return new NextResponse(robots, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
