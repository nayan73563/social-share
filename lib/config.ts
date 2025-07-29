// Site configuration for social media sharing
export const SITE_CONFIG = {
  name: "Social Media Hub",
  description: "Create and share viral social media content",
  twitter: "@SocialMediaHub",
  facebook: "SocialMediaHub",
  instagram: "@socialmediahub",
  linkedin: "social-media-hub",

  // SEO settings
  keywords: [
    "viral content",
    "social media",
    "trending",
    "entertainment",
    "videos",
    "memes",
    "content creator",
    "social sharing",
  ],
}

// Helper function to get current domain dynamically
export const getCurrentDomain = (): string => {
  // Environment variable (production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Development fallback
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }

  // Try to detect from window (client-side)
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // Server-side fallback
  return "https://your-domain.com"
}

// Helper function to get absolute URL
export const getAbsoluteUrl = (path: string): string => {
  if (!path) return getCurrentDomain()
  if (path.startsWith("http")) return path
  return `${getCurrentDomain()}${path.startsWith("/") ? path : `/${path}`}`
}

// Helper function to optimize image for social media
export const optimizeImageForSocial = (imageUrl: string, platform: "og" | "twitter" | "facebook" = "og"): string => {
  if (!imageUrl) return getAbsoluteUrl("/placeholder.svg?height=630&width=1200&text=Social+Media+Post")

  // If it's a Cloudinary URL, optimize it
  if (imageUrl.includes("cloudinary.com")) {
    const optimizations = {
      og: "w_1200,h_630,c_fill,f_auto,q_auto",
      twitter: "w_1200,h_630,c_fill,f_auto,q_auto",
      facebook: "w_1200,h_630,c_fill,f_auto,q_auto",
    }

    return imageUrl.replace("/upload/", `/upload/${optimizations[platform]}/`)
  }

  return getAbsoluteUrl(imageUrl)
}
