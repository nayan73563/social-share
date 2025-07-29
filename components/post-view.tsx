"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Share, MoreHorizontal, ThumbsUp, Send } from "lucide-react"
import { formatTimeAgo, generateRandomStats } from "@/lib/utils"
import { extractVideoId, generateThumbnail } from "@/lib/cloudinary"
import { supabase } from "@/lib/supabase"
import type { Post } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  user: string
  text: string
  time: string
  avatar: string
  isReal: boolean
}

interface PostViewProps {
  post: Post
  showAd?: boolean
  onSkipAd?: () => void
}

export default function PostView({ post, showAd = false, onSkipAd }: PostViewProps) {
  const [stats, setStats] = useState(() => ({
    ...generateRandomStats(),
    comments: Math.floor(Math.random() * 1500) + 500, // 500-2000 range for fake comments
  }))
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [liked, setLiked] = useState(false)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Static post time - calculated once and never changes
  const [postTime] = useState(() => {
    const hoursAgo = Math.floor(Math.random() * 5) + 2
    const minutesAgo = Math.floor(Math.random() * 60)
    const initialTime = Date.now() - hoursAgo * 60 * 60 * 1000 - minutesAgo * 60 * 1000

    // Calculate the time difference once and make it static
    const diffInMinutes = Math.floor((Date.now() - initialTime) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else {
      const hours = Math.floor(diffInMinutes / 60)
      const minutes = diffInMinutes % 60
      if (minutes === 0) {
        return `${hours}h ago`
      } else {
        return `${hours}h ${minutes}m ago`
      }
    }
  })

  const { toast } = useToast()

  // Random profile names that will change on each visit
  const profileNames = [
    "Viral Hub",
    "Trending Now",
    "Buzz Central",
    "Viral Zone",
    "Hot Topics",
    "Trend Master",
    "Viral Feed",
    "Buzz Station",
    "Trend Hub",
    "Viral Point",
    "Hot Buzz",
    "Trend Zone",
    "Viral Stream",
    "Buzz Hub",
    "Trend Wave",
  ]

  const fakeComments: Comment[] = [
    {
      id: "fake1",
      user: "Sarah Chen",
      text: "Exactly what I was looking for! 🔥",
      time: "33 minutes ago",
      avatar: "SC",
      isReal: false,
    },
    {
      id: "fake2",
      user: "Emily Davis",
      text: "Love this! Keep it up! 💯",
      time: "12 hours ago",
      avatar: "ED",
      isReal: false,
    },
    {
      id: "fake3",
      user: "Mike Johnson",
      text: "This is amazing content! Thanks for sharing 👏",
      time: "2 hours ago",
      avatar: "MJ",
      isReal: false,
    },
    {
      id: "fake4",
      user: "Alex Rodriguez",
      text: "Wow! This is incredible! 😍",
      time: "1 hour ago",
      avatar: "AR",
      isReal: false,
    },
    {
      id: "fake5",
      user: "Jessica Kim",
      text: "Thanks for sharing this! Very helpful 🙏",
      time: "45 minutes ago",
      avatar: "JK",
      isReal: false,
    },
  ]

  useEffect(() => {
    // Generate or retrieve profile name for this session
    const generateProfileName = () => {
      const currentUrl = window.location.href
      const sessionKey = `profile_name_${currentUrl}`

      // Check if we already have a profile name for this session
      let storedName = sessionStorage.getItem(sessionKey)

      if (!storedName) {
        // Generate a new random profile name
        const randomIndex = Math.floor(Math.random() * profileNames.length)
        storedName = profileNames[randomIndex]

        // Store it in session storage (will persist until tab is closed)
        sessionStorage.setItem(sessionKey, storedName)
      }

      setProfileName(storedName)
    }

    generateProfileName()
    loadComments()

    // No interval for time updates - time stays static
  }, [])

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const realComments: Comment[] = (data || []).map((comment) => ({
        id: comment.id,
        user: comment.user_name,
        text: comment.comment_text,
        time: formatTimeAgo(comment.created_at),
        avatar: comment.user_name.substring(0, 2).toUpperCase(),
        isReal: true,
      }))

      // Show 4-5 random fake comments
      const randomFakeComments = fakeComments
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 2) + 4) // 4-5 comments

      // Combine real and fake comments
      const allComments = [...realComments, ...randomFakeComments]
      setComments(allComments)

      // Update stats to include real comments + fake comment count
      setStats((prev) => ({
        ...prev,
        comments: prev.comments + realComments.length,
      }))
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLiked(!liked)
    setStats((prev) => ({
      ...prev,
      likes: liked ? prev.likes - 1 : prev.likes + 1,
    }))

    try {
      if (!liked) {
        await supabase.from("post_likes").insert({
          post_id: post.id,
          user_ip: "anonymous",
        })
      }
    } catch (error) {
      console.error("Error saving like:", error)
    }
  }

  const handleComment = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    if (isSubmittingComment) return

    setIsSubmittingComment(true)
    const userName = `User${Math.floor(Math.random() * 1000)}`

    try {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: post.id,
          user_name: userName,
          comment_text: newComment.trim(),
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      const newCommentObj: Comment = {
        id: data.id,
        user: userName,
        text: newComment.trim(),
        time: "Just now",
        avatar: userName.substring(0, 2).toUpperCase(),
        isReal: true,
      }

      setComments((prev) => [newCommentObj, ...prev])
      setNewComment("")
      setShowCommentInput(false)
      setStats((prev) => ({ ...prev, comments: prev.comments + 1 }))

      toast({
        title: "Comment Added!",
        description: "Your comment has been posted successfully.",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setStats((prev) => ({ ...prev, shares: prev.shares + 1 }))

    try {
      await supabase.from("post_shares").insert({
        post_id: post.id,
        user_ip: "anonymous",
      })
    } catch (error) {
      console.error("Error saving share:", error)
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || "Check out this post",
          text: post.description || "",
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied!",
        description: "Post link copied to clipboard",
      })
    }
  }

  const handleCommentToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowCommentInput(!showCommentInput)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleComment(e as any)
    }
  }

  // Enhanced video info extraction
  const getVideoInfo = () => {
    // First try video_url
    if (post.video_url) {
      console.log("🔍 Checking video_url:", post.video_url)
      return extractVideoId(post.video_url)
    }

    // Then try embed_code
    if (post.embed_code) {
      console.log("🔍 Checking embed_code:", post.embed_code)

      // Extract YouTube URL from embed code
      const youtubeEmbedMatch = post.embed_code.match(/src=['"]([^'"]*youtube\.com\/embed\/[^'"]*)['"]/i)
      if (youtubeEmbedMatch) {
        const embedUrl = youtubeEmbedMatch[1]
        console.log("🎥 Found YouTube embed URL:", embedUrl)
        return extractVideoId(embedUrl)
      }

      // Extract Vimeo URL from embed code
      const vimeoEmbedMatch = post.embed_code.match(/src=['"]([^'"]*player\.vimeo\.com\/video\/[^'"]*)['"]/i)
      if (vimeoEmbedMatch) {
        const embedUrl = vimeoEmbedMatch[1]
        console.log("🎬 Found Vimeo embed URL:", embedUrl)
        return extractVideoId(embedUrl)
      }

      // Extract TikTok URL from embed code
      const tiktokEmbedMatch = post.embed_code.match(/src=['"]([^'"]*tiktok\.com\/embed\/[^'"]*)['"]/i)
      if (tiktokEmbedMatch) {
        const embedUrl = tiktokEmbedMatch[1]
        console.log("📱 Found TikTok embed URL:", embedUrl)
        return extractVideoId(embedUrl)
      }
    }

    return null
  }

  const videoInfo = getVideoInfo()

  // CORRECTED: Priority for thumbnail with proper logic
  const getDisplayThumbnail = () => {
    console.log("🔍 Thumbnail Priority Check:")
    console.log("- Custom thumbnail_url:", post.thumbnail_url)
    console.log("- Media URL:", post.media_url, "Type:", post.media_type)
    console.log("- Video URL:", post.video_url)
    console.log("- Embed Code:", post.embed_code ? "Present" : "None")
    console.log("- Video Info:", videoInfo)

    // 1. HIGHEST PRIORITY: Custom uploaded thumbnail
    if (post.thumbnail_url) {
      console.log("✅ Using CUSTOM uploaded thumbnail:", post.thumbnail_url)
      return post.thumbnail_url
    }

    // 2. SECOND PRIORITY: If media is an image, use that
    if (post.media_url && post.media_type === "image") {
      console.log("✅ Using uploaded media image:", post.media_url)
      return post.media_url
    }

    // 3. THIRD PRIORITY: Auto-generated from video
    if (videoInfo) {
      const autoThumbnail = generateThumbnail(videoInfo)
      console.log("✅ Using AUTO-GENERATED video thumbnail:", autoThumbnail)
      return autoThumbnail
    }

    console.log("❌ No thumbnail available")
    return null
  }

  const displayThumbnail = getDisplayThumbnail()

  // Generate avatar initials from profile name
  const getAvatarInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const renderMedia = () => {
    console.log("🎬 Rendering media with thumbnail:", displayThumbnail)

    // 1. If there's an embed code, render it with thumbnail overlay
    if (post.embed_code) {
      return (
        <div className="relative w-full bg-black rounded-lg overflow-hidden mb-3">
          {/* Show thumbnail overlay if available */}
          {displayThumbnail && (
            <div
              className="absolute inset-0 bg-cover bg-center z-10 flex items-center justify-center cursor-pointer thumbnail-overlay"
              style={{ backgroundImage: `url(${displayThumbnail})` }}
              onClick={() => {
                // Hide thumbnail overlay when clicked to reveal video
                const overlay = document.querySelector(".thumbnail-overlay") as HTMLElement
                if (overlay) overlay.style.display = "none"
              }}
            >
              <div className="bg-black/50 rounded-full p-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
          <div
            className="relative w-full pb-[56.25%] h-0 overflow-hidden"
            dangerouslySetInnerHTML={{
              __html: post.embed_code.replace(
                /<iframe/g,
                '<iframe class="absolute top-0 left-0 w-full h-full border-0"',
              ),
            }}
          />
        </div>
      )
    }

    // 2. If there's uploaded media, render it
    if (post.media_url) {
      if (post.media_type === "video") {
        return (
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-3">
            <video controls className="w-full h-full object-cover" poster={displayThumbnail || undefined}>
              <source src={post.media_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )
      } else {
        // It's an image
        return (
          <div className="w-full mb-3">
            <img
              src={post.media_url || "/placeholder.svg"}
              alt={post.title || "Post media"}
              className="w-full max-h-[600px] object-cover rounded-lg"
            />
          </div>
        )
      }
    }

    // 3. If there's a video URL, render it with thumbnail
    if (videoInfo) {
      if (videoInfo.platform === "direct") {
        return (
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-3">
            <video controls className="w-full h-full object-cover" poster={displayThumbnail || undefined}>
              <source src={videoInfo.embedUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )
      } else {
        return (
          <div className="relative w-full bg-black rounded-lg overflow-hidden mb-3">
            {/* Show thumbnail overlay for video URLs */}
            {displayThumbnail && (
              <div
                className="absolute inset-0 bg-cover bg-center z-10 flex items-center justify-center cursor-pointer thumbnail-overlay"
                style={{ backgroundImage: `url(${displayThumbnail})` }}
                onClick={() => {
                  // Hide thumbnail overlay when clicked to reveal video
                  const overlay = document.querySelector(".thumbnail-overlay") as HTMLElement
                  if (overlay) overlay.style.display = "none"
                }}
              >
                <div className="bg-black/50 rounded-full p-4">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="relative w-full pb-[56.25%] h-0 overflow-hidden">
              <iframe
                src={videoInfo.embedUrl}
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )
      }
    }

    // 4. If only thumbnail exists (no video/media), show just the thumbnail
    if (displayThumbnail) {
      return (
        <div className="w-full mb-3">
          <img
            src={displayThumbnail || "/placeholder.svg"}
            alt={post.title || "Post thumbnail"}
            className="w-full max-h-[600px] object-cover rounded-lg"
          />
        </div>
      )
    }

    // 5. No media at all
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {/* Dynamic Avatar based on profile name */}
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{getAvatarInitials(profileName)}</span>
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900">{profileName}</div>
              <div className="text-xs text-gray-500">{postTime}</div> {/* Static time - never changes */}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="p-4">
          {/* Title/Description */}
          {(post.title || post.description) && (
            <div className="mb-4">
              <p className="text-gray-900 text-base leading-relaxed break-words">{post.title || post.description}</p>
            </div>
          )}

          {/* Media Content */}
          <div className="w-full overflow-hidden">{renderMedia()}</div>

          {/* Channel/Source Info */}
          <div className="text-sm text-gray-600 mb-4">TEM SPORTS</div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between py-3 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <button
                className={`flex items-center space-x-2 ${liked ? "text-blue-600" : "text-gray-600"} hover:bg-gray-100 px-2 py-1 rounded transition-colors`}
                onClick={handleLike}
              >
                <ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                <span className="text-sm font-medium">{stats.likes}</span>
              </button>

              <button
                className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                onClick={handleCommentToggle}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{stats.comments}</span>
              </button>

              <div className="text-sm text-gray-600">{stats.views.toLocaleString()} views</div>
            </div>

            <button
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded flex items-center transition-colors"
              onClick={handleShare}
            >
              <Share className="w-4 h-4 mr-2" />
              Share ({stats.shares})
            </button>
          </div>
        </div>

        {/* Comment Input */}
        {showCommentInput && (
          <div className="px-4 pb-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mt-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">U</span>
              </div>
              <div className="flex-1 flex space-x-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a comment..."
                  className="flex-1"
                  disabled={isSubmittingComment}
                />
                <Button
                  onClick={handleComment}
                  size="sm"
                  className="flex-shrink-0"
                  disabled={isSubmittingComment || !newComment.trim()}
                >
                  {isSubmittingComment ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="px-4 pb-4">
          {comments.length > 0 && (
            <div className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">Comments ({comments.length})</div>
          )}

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${comment.isReal ? "bg-green-500" : "bg-blue-500"}`}
                >
                  <span className="text-white text-xs font-medium">{comment.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="font-semibold text-sm text-gray-900 flex items-center flex-wrap">
                      <span className="break-words">{comment.user}</span>
                      {comment.isReal && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded flex-shrink-0">
                          Real
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-800 break-words">{comment.text}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-3">{comment.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
