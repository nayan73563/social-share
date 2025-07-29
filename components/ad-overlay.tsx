"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PostView from "./post-view"
import type { Post } from "@/lib/supabase"

interface AdOverlayProps {
  post: Post
}

export default function AdOverlay({ post }: AdOverlayProps) {
  const [showAd, setShowAd] = useState(true)
  const router = useRouter()

  // Load popunder ad script function - only called after skip ad
  const loadPopunderScript = () => {
    if (!post.popunder_ad) return

    try {
      // Extract script URL from the ad code
      let scriptUrl = ""

      // Check if it's a complete script tag
      const scriptTagMatch = post.popunder_ad.match(/src=['"]([^'"]+)['"]/i)
      if (scriptTagMatch) {
        scriptUrl = scriptTagMatch[1]
      }
      // Check if it's just a URL
      else if (post.popunder_ad.trim().startsWith("http") || post.popunder_ad.trim().startsWith("//")) {
        scriptUrl = post.popunder_ad.trim()
      }

      if (scriptUrl) {
        // Handle protocol-relative URLs
        if (scriptUrl.startsWith("//")) {
          scriptUrl = "https:" + scriptUrl
        }

        // Create and load the script
        const script = document.createElement("script")
        script.type = "text/javascript"
        script.src = scriptUrl
        script.async = true

        // Add to head for better compatibility
        document.head.appendChild(script)
      } else {
        // Handle inline JavaScript code
        try {
          // Clean the code
          const cleanCode = post.popunder_ad.replace(/<script[^>]*>|<\/script>/gi, "").trim()

          if (cleanCode) {
            // Create script element for inline code
            const script = document.createElement("script")
            script.type = "text/javascript"
            script.innerHTML = cleanCode
            document.head.appendChild(script)
          }
        } catch (error) {
          console.error("Error executing inline popunder code:", error)
        }
      }
    } catch (error) {
      console.error("Error loading popunder script:", error)
    }
  }

  const handleSkipAd = () => {
    // Load popunder script only when skip ad is clicked
    if (post.popunder_ad) {
      loadPopunderScript()
    }

    // If there's a redirect link, open it
    if (post.redirect_link) {
      window.open(post.redirect_link, "_blank")
    }

    // Hide the overlay
    setShowAd(false)
  }

  return (
    <div>
      {/* Post content - completely isolated when ad is hidden */}
      <PostView post={post} showAd={showAd} onSkipAd={handleSkipAd} />

      {/* Ad Overlay - Only one overlay */}
      {showAd && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center text-white max-w-md mx-auto p-8">
            <div className="text-2xl font-bold mb-8">Advertisement</div>

            {/* Skip Ad Button */}
            <button
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold transition-all border border-white/30 backdrop-blur-sm text-lg skip-button"
              onClick={handleSkipAd}
            >
              Skip Ad
            </button>
            <div className="text-sm mt-3 opacity-75">Click to continue</div>
          </div>
        </div>
      )}
    </div>
  )
}
