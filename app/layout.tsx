import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Social Media Post Generator - Create Viral Content",
  description:
    "Create amazing viral social media posts with monetization features. Generate engaging content that gets shared across all platforms.",
  keywords: "social media, post generator, viral content, monetization, content creator",
  authors: [{ name: "Social Media Hub" }],
  creator: "Social Media Hub",
  publisher: "Social Media Hub",

  // Default Open Graph for homepage
  openGraph: {
    title: "Social Media Post Generator - Create Viral Content",
    description: "Create amazing viral social media posts with monetization features",
    url: "https://social-share-rust.vercel.app",
    siteName: "Social Media Hub",
    images: [
      {
        url: "https://via.placeholder.com/1200x630/1877f2/ffffff?text=Social+Media+Post+Generator",
        width: 1200,
        height: 630,
        alt: "Social Media Post Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card for homepage
  twitter: {
    card: "summary_large_image",
    title: "Social Media Post Generator",
    description: "Create amazing viral social media posts with monetization features",
    images: ["https://via.placeholder.com/1200x630/1877f2/ffffff?text=Social+Media+Post+Generator"],
  },

  // Additional meta tags
  other: {
    "theme-color": "#1877f2",
    "msapplication-TileColor": "#1877f2",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for better social media support */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://via.placeholder.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* DNS prefetch for social media domains */}
        <link rel="dns-prefetch" href="//facebook.com" />
        <link rel="dns-prefetch" href="//twitter.com" />
        <link rel="dns-prefetch" href="//linkedin.com" />
        <link rel="dns-prefetch" href="//whatsapp.com" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
