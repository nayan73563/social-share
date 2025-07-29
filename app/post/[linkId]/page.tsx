import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { supabase } from "@/lib/supabase"
import AdOverlay from "@/components/ad-overlay"

interface PageProps {
  params: { linkId: string }
}

async function getPost(linkId: string) {
  const { data, error } = await supabase
    .from("generated_links")
    .select(`
      *,
      posts (*)
    `)
    .eq("link_id", linkId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

// Bulletproof domain detection - works everywhere without env variables
function getCurrentDomain(): string {
  try {
    // 1. Try environment variable first (if available)
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    }

    // 2. Try Vercel automatic URL (works in production)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }

    // 3. Try to get from request headers (works for social media crawlers)
    const headersList = headers()
    const host = headersList.get("host")
    const forwardedProto = headersList.get("x-forwarded-proto")
    const forwardedHost = headersList.get("x-forwarded-host")
    const userAgent = headersList.get("user-agent") || ""

    // Detect if it's a social media crawler
    const isSocialCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discordbot/i.test(userAgent)

    if (host) {
      // Use forwarded host if available (for proxies)
      const actualHost = forwardedHost || host

      // Determine protocol
      let protocol = "https"
      if (forwardedProto) {
        protocol = forwardedProto
      } else if (host.includes("localhost") || host.includes("127.0.0.1")) {
        protocol = "http"
      }

      const detectedDomain = `${protocol}://${actualHost}`
      console.log(`🔍 Domain detected from headers: ${detectedDomain} (Crawler: ${isSocialCrawler})`)
      return detectedDomain
    }

    // 4. Development fallback
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:3000"
    }

    // 5. Production fallback - try common patterns
    const possibleDomains = [
      "https://social-share-rust.vercel.app", // Your current domain
      "https://social-media-generator.vercel.app",
      "https://viral-post-generator.vercel.app",
    ]

    // Return the first one as fallback
    return possibleDomains[0]
  } catch (error) {
    console.error("Error detecting domain:", error)
    // Ultimate fallback
    return "https://social-share-rust.vercel.app"
  }
}

// Enhanced image URL generator with multiple fallbacks
function getAbsoluteImageUrl(url: string | null, title: string, currentDomain: string): string {
  // If we have a valid image URL
  if (url) {
    // If already absolute, return as is
    if (url.startsWith("http")) {
      return url
    }
    // Make relative URLs absolute
    return `${currentDomain}${url.startsWith("/") ? url : `/${url}`}`
  }

  // Fallback image options (in order of preference)
  const fallbackImages = [
    // 1. Placeholder.com with custom text
    `https://via.placeholder.com/1200x630/1877f2/ffffff?text=${encodeURIComponent(title.substring(0, 50))}`,

    // 2. Unsplash random image
    `https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=630&fit=crop&crop=center`,

    // 3. Picsum random image
    `https://picsum.photos/1200/630?random=${Math.floor(Math.random() * 1000)}`,

    // 4. Simple colored background
    `https://dummyimage.com/1200x630/1877f2/ffffff&text=${encodeURIComponent(title.substring(0, 30))}`,
  ]

  return fallbackImages[0]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const linkData = await getPost(params.linkId)

  if (!linkData) {
    return {
      title: "Post Not Found - Social Media Hub",
      description: "The requested social media post could not be found.",
      openGraph: {
        title: "Post Not Found",
        description: "The requested social media post could not be found.",
        images: [
          {
            url: "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Post+Not+Found",
            width: 1200,
            height: 630,
            alt: "Post Not Found",
          },
        ],
      },
    }
  }

  const post = linkData.posts
  const title = post.title || linkData.title || "🔥 Amazing Viral Content - Don't Miss This!"
  const description =
    post.description ||
    "Check out this incredible viral content that everyone is talking about! Click to see what's trending now. 🚀✨"

  // Get current domain with bulletproof detection
  const currentDomain = getCurrentDomain()
  console.log(`🌐 Using domain: ${currentDomain}`)

  // CORRECTED: Smart thumbnail priority - Custom thumbnail gets HIGHEST priority
  let thumbnailUrl = ""

  // 1. HIGHEST PRIORITY: Custom uploaded thumbnail (if user uploaded one)
  if (post.thumbnail_url) {
    thumbnailUrl = post.thumbnail_url
    console.log("📸 Using CUSTOM uploaded thumbnail:", thumbnailUrl)
  }
  // 2. SECOND PRIORITY: If media is an image, use that
  else if (post.media_url && post.media_type === "image") {
    thumbnailUrl = post.media_url
    console.log("🖼️ Using uploaded media image as thumbnail:", thumbnailUrl)
  }
  // 3. THIRD PRIORITY: Auto-generate from video URL (embed code or video URL)
  else if (post.video_url) {
    // Try to extract thumbnail from video URL
    const youtubeMatch = post.video_url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    )
    if (youtubeMatch) {
      thumbnailUrl = `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
      console.log("🎥 Using AUTO-GENERATED YouTube thumbnail:", thumbnailUrl)
    }

    // Try Vimeo
    const vimeoMatch = post.video_url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch && !thumbnailUrl) {
      thumbnailUrl = `https://vumbnail.com/${vimeoMatch[1]}.jpg`
      console.log("🎬 Using AUTO-GENERATED Vimeo thumbnail:", thumbnailUrl)
    }
  }
  // 4. FOURTH PRIORITY: Try to extract from embed code
  else if (post.embed_code) {
    // Try to extract YouTube ID from embed code
    const youtubeEmbedMatch = post.embed_code.match(/youtube\.com\/embed\/([^"&?/\s]{11})/)
    if (youtubeEmbedMatch) {
      thumbnailUrl = `https://img.youtube.com/vi/${youtubeEmbedMatch[1]}/maxresdefault.jpg`
      console.log("🎥 Using AUTO-GENERATED thumbnail from embed code:", thumbnailUrl)
    }

    // Try to extract Vimeo ID from embed code
    const vimeoEmbedMatch = post.embed_code.match(/player\.vimeo\.com\/video\/(\d+)/)
    if (vimeoEmbedMatch && !thumbnailUrl) {
      thumbnailUrl = `https://vumbnail.com/${vimeoEmbedMatch[1]}.jpg`
      console.log("🎬 Using AUTO-GENERATED Vimeo thumbnail from embed code:", thumbnailUrl)
    }
  }

  // If no thumbnail found, getAbsoluteImageUrl will create a placeholder
  const absoluteThumbnail = getAbsoluteImageUrl(thumbnailUrl, title, currentDomain)
  const postUrl = `${currentDomain}/post/${params.linkId}`

  console.log("🎯 Final metadata:", {
    title: title.substring(0, 60) + "...",
    description: description.substring(0, 100) + "...",
    thumbnail: absoluteThumbnail,
    url: postUrl,
    domain: currentDomain,
  })

  // Enhanced metadata with maximum compatibility
  return {
    title,
    description,
    keywords: "viral content, social media, trending, entertainment, videos, memes, funny, amazing, must watch",
    authors: [{ name: "Social Media Hub" }],
    creator: "Social Media Hub",
    publisher: "Social Media Hub",
    category: "Entertainment",

    // Open Graph tags for Facebook, LinkedIn, WhatsApp, Discord
    openGraph: {
      title,
      description,
      url: postUrl,
      siteName: "Social Media Hub - Viral Content",
      type: "article",
      locale: "en_US",
      images: [
        {
          url: absoluteThumbnail,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg",
        },
        {
          url: absoluteThumbnail,
          width: 1200,
          height: 600,
          alt: title,
          type: "image/jpeg",
        },
        {
          url: absoluteThumbnail,
          width: 800,
          height: 600,
          alt: title,
          type: "image/jpeg",
        },
        {
          url: absoluteThumbnail,
          width: 400,
          height: 400,
          alt: title,
          type: "image/jpeg",
        },
      ],
      videos: post.video_url
        ? [
            {
              url: post.video_url,
              width: 1280,
              height: 720,
              type: "video/mp4",
            },
          ]
        : undefined,
    },

    // Twitter Card tags
    twitter: {
      card: "summary_large_image",
      site: "@SocialMediaHub",
      creator: "@SocialMediaHub",
      title,
      description,
      images: [
        {
          url: absoluteThumbnail,
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },

    // Additional meta tags for maximum social media compatibility
    other: {
      // Facebook specific
      "fb:app_id": "123456789", // Generic app ID
      "fb:pages": "socialmediahub",

      // Open Graph enhanced
      "og:updated_time": post.created_at,
      "og:image:secure_url": absoluteThumbnail,
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:alt": title,
      "og:image:type": "image/jpeg",
      "og:rich_attachment": "true",

      // Article specific
      "article:published_time": post.created_at,
      "article:modified_time": post.created_at,
      "article:author": "Social Media Hub",
      "article:section": "Viral Content",
      "article:tag": "viral, trending, social media, entertainment",

      // Twitter enhanced
      "twitter:domain": currentDomain.replace(/https?:\/\//, ""),
      "twitter:url": postUrl,
      "twitter:image:src": absoluteThumbnail,
      "twitter:label1": "Category",
      "twitter:data1": "Viral Content",
      "twitter:label2": "Reading Time",
      "twitter:data2": "1 min",

      // WhatsApp specific
      "og:image:width": "300",
      "og:image:height": "300",

      // Telegram specific
      "telegram:channel": "@socialmediahub",

      // Discord specific
      "theme-color": "#1877f2",

      // LinkedIn specific
      "linkedin:owner": "Social Media Hub",

      // Pinterest specific
      "pinterest-rich-pin": "true",
      "pinterest:description": description,

      // General social media
      "msapplication-TileColor": "#1877f2",
      "msapplication-TileImage": absoluteThumbnail,

      // Mobile app deep linking
      "al:web:url": postUrl,
      "al:web:should_fallback": "true",

      // Schema.org structured data
      "application-name": "Social Media Hub",
      "msapplication-tooltip": title,

      // Additional SEO
      rating: "general",
      distribution: "global",
      "revisit-after": "1 days",
      language: "en",
      "geo.region": "US",
      "geo.placename": "United States",

      // Cache control hints
      "cache-control": "public, max-age=3600",
    },

    // Enhanced robots configuration
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
      "facebook-crawler": {
        index: true,
        follow: true,
      },
    },

    // Icons and manifest
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },

    // Verification (optional)
    verification: {
      google: "social-media-hub-verification",
      yandex: "social-media-hub-verification",
    },

    // App links for mobile
    appLinks: {
      web: {
        url: postUrl,
        should_fallback: true,
      },
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const linkData = await getPost(params.linkId)

  if (!linkData) {
    notFound()
  }

  return <AdOverlay post={linkData.posts} />
}
