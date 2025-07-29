export const CLOUDINARY_CONFIG = {
  cloudName: "dmq5lbyso",
  uploadPreset: "social-media-24", // Updated to match your upload preset
  apiKey: "727941721299461",
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    console.log("Starting Cloudinary upload for file:", file.name, "Size:", file.size)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset)
    formData.append("cloud_name", CLOUDINARY_CONFIG.cloudName)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`
    console.log("Upload URL:", uploadUrl)
    console.log("Using upload preset:", CLOUDINARY_CONFIG.uploadPreset)

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    })

    console.log("Cloudinary response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Cloudinary error response:", errorText)
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Cloudinary upload successful:", data.secure_url)

    return data.secure_url
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error(`Failed to upload to Cloudinary: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const extractVideoId = (url: string): { platform: string; id: string; embedUrl: string } | null => {
  console.log("🔍 Extracting video ID from:", url)

  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    /youtube\.com\/embed\/([^"&?/\s]{11})/,
    /youtu\.be\/([^"&?/\s]{11})/,
  ]

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern)
    if (match) {
      console.log("✅ Found YouTube video ID:", match[1])
      return {
        platform: "youtube",
        id: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
      }
    }
  }

  // TikTok patterns
  const tiktokPatterns = [
    /tiktok\.com\/.*\/video\/(\d+)/,
    /tiktok\.com\/embed\/v2\/(\d+)/,
    /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
  ]

  for (const pattern of tiktokPatterns) {
    const match = url.match(pattern)
    if (match) {
      console.log("✅ Found TikTok video ID:", match[1])
      return {
        platform: "tiktok",
        id: match[1],
        embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
      }
    }
  }

  // Instagram patterns
  const instagramPatterns = [
    /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/p\/([A-Za-z0-9_-]+)\/embed/,
  ]

  for (const pattern of instagramPatterns) {
    const match = url.match(pattern)
    if (match) {
      console.log("✅ Found Instagram post ID:", match[1])
      return {
        platform: "instagram",
        id: match[1],
        embedUrl: `https://www.instagram.com/p/${match[1]}/embed`,
      }
    }
  }

  // Vimeo patterns
  const vimeoPatterns = [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/]

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern)
    if (match) {
      console.log("✅ Found Vimeo video ID:", match[1])
      return {
        platform: "vimeo",
        id: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
      }
    }
  }

  // Direct video URLs
  const videoExtensions = /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i
  if (videoExtensions.test(url)) {
    console.log("✅ Found direct video URL")
    return {
      platform: "direct",
      id: url,
      embedUrl: url,
    }
  }

  console.log("❌ No video ID found in URL")
  return null
}

export const generateThumbnail = (videoInfo: { platform: string; id: string } | null): string => {
  if (!videoInfo) {
    console.log("❌ No video info for thumbnail generation")
    return "/placeholder.svg?height=400&width=600&text=Video+Thumbnail"
  }

  console.log("🎨 Generating thumbnail for:", videoInfo.platform, videoInfo.id)

  switch (videoInfo.platform) {
    case "youtube":
      const youtubeThumbnail = `https://img.youtube.com/vi/${videoInfo.id}/maxresdefault.jpg`
      console.log("🎥 Generated YouTube thumbnail:", youtubeThumbnail)
      return youtubeThumbnail

    case "vimeo":
      const vimeoThumbnail = `https://vumbnail.com/${videoInfo.id}.jpg`
      console.log("🎬 Generated Vimeo thumbnail:", vimeoThumbnail)
      return vimeoThumbnail

    case "tiktok":
      // TikTok doesn't have a direct thumbnail API, use placeholder
      const tiktokThumbnail = "/placeholder.svg?height=400&width=600&text=TikTok+Video"
      console.log("📱 Generated TikTok placeholder:", tiktokThumbnail)
      return tiktokThumbnail

    case "instagram":
      // Instagram doesn't allow direct thumbnail access, use placeholder
      const instagramThumbnail = "/placeholder.svg?height=400&width=600&text=Instagram+Post"
      console.log("📷 Generated Instagram placeholder:", instagramThumbnail)
      return instagramThumbnail

    default:
      const defaultThumbnail = "/placeholder.svg?height=400&width=600&text=Video+Thumbnail"
      console.log("🖼️ Generated default thumbnail:", defaultThumbnail)
      return defaultThumbnail
  }
}
