"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, LinkIcon, Video, DollarSign, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { supabase } from "@/lib/supabase"
import { generateLinkId } from "@/lib/utils"

interface FormData {
  title: string
  description: string
  embedCode: string
  videoUrl: string
  mediaFile: File | null
  thumbnailFile: File | null
  redirectLink: string
  popunderAd: string
}

interface FormSectionProps {
  onLinkGenerated: (linkId: string) => void
}

export default function FormSection({ onLinkGenerated }: FormSectionProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    embedCode: "",
    videoUrl: "",
    mediaFile: null,
    thumbnailFile: null,
    redirectLink: "",
    popunderAd: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const { toast } = useToast()

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: "mediaFile" | "thumbnailFile", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim() && !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Either title or description is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.redirectLink.trim() && !formData.popunderAd.trim()) {
      toast({
        title: "Validation Error",
        description: "At least one monetization method is required (redirect link or popunder ad)",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      embedCode: "",
      videoUrl: "",
      mediaFile: null,
      thumbnailFile: null,
      redirectLink: "",
      popunderAd: "",
    })

    // Clear file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>
    fileInputs.forEach((input) => (input.value = ""))

    toast({
      title: "Form Cleared",
      description: "All form fields have been cleared",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setUploadProgress("")

    try {
      // Upload media files to Cloudinary
      let mediaUrl = ""
      let mediaType = ""
      let thumbnailUrl = ""

      if (formData.mediaFile) {
        try {
          setUploadProgress("Uploading media file...")
          console.log("Uploading media file:", formData.mediaFile.name, "Type:", formData.mediaFile.type)

          // Check file size (limit to 100MB)
          if (formData.mediaFile.size > 100 * 1024 * 1024) {
            throw new Error("File size too large. Please use a file smaller than 100MB.")
          }

          mediaUrl = await uploadToCloudinary(formData.mediaFile)
          mediaType = formData.mediaFile.type.startsWith("video/") ? "video" : "image"
          console.log("Media uploaded successfully:", mediaUrl)
        } catch (error) {
          console.error("Media upload failed:", error)
          throw new Error(`Media upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      }

      if (formData.thumbnailFile) {
        try {
          setUploadProgress("Uploading thumbnail...")
          console.log("Uploading thumbnail file:", formData.thumbnailFile.name)

          // Check file size (limit to 10MB for thumbnails)
          if (formData.thumbnailFile.size > 10 * 1024 * 1024) {
            throw new Error("Thumbnail file size too large. Please use a file smaller than 10MB.")
          }

          thumbnailUrl = await uploadToCloudinary(formData.thumbnailFile)
          console.log("Thumbnail uploaded successfully:", thumbnailUrl)
        } catch (error) {
          console.error("Thumbnail upload failed:", error)
          throw new Error(`Thumbnail upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      }

      setUploadProgress("Creating post...")

      // Create post in database
      const postData = {
        title: formData.title || null,
        description: formData.description || null,
        embed_code: formData.embedCode || null,
        video_url: formData.videoUrl || null,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        thumbnail_url: thumbnailUrl || null,
        redirect_link: formData.redirectLink || null,
        popunder_ad: formData.popunderAd || null,
      }

      console.log("Creating post with data:", postData)

      const { data: post, error: postError } = await supabase.from("posts").insert(postData).select().single()

      if (postError) {
        console.error("Post creation error:", postError)
        throw new Error(`Database error: ${postError.message}`)
      }

      console.log("Post created successfully:", post)

      // Generate unique link ID
      const linkId = generateLinkId()

      // Create generated link
      const { error: linkError } = await supabase.from("generated_links").insert({
        post_id: post.id,
        link_id: linkId,
        title: formData.title || formData.description?.substring(0, 50) || "Untitled Post",
      })

      if (linkError) {
        console.error("Link creation error:", linkError)
        throw new Error(`Link creation error: ${linkError.message}`)
      }

      toast({
        title: "Success!",
        description: "Your social media post has been generated successfully",
      })

      setUploadProgress("")
      // DON'T reset form - keep data for multiple link generation
      onLinkGenerated(linkId)
    } catch (error) {
      console.error("Error creating post:", error)
      setUploadProgress("")

      let errorMessage = "Unknown error occurred"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadProgress("")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Social Media Post Generator
        </CardTitle>
        <CardDescription>Create viral social media posts with monetization features</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter post title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter post description"
                rows={4}
              />
            </div>
          </div>

          {/* Media Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5" />
              Media Content
            </h3>

            <div>
              <Label htmlFor="embedCode">Embed Code</Label>
              <Textarea
                id="embedCode"
                value={formData.embedCode}
                onChange={(e) => handleInputChange("embedCode", e.target.value)}
                placeholder="Paste YouTube, TikTok, Instagram iframe embed code"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=... or direct video URL"
              />
            </div>

            <div>
              <Label htmlFor="mediaFile">Upload Media (Max 100MB)</Label>
              <Input
                id="mediaFile"
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileChange("mediaFile", e.target.files?.[0] || null)}
              />
              {formData.mediaFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {formData.mediaFile.name} ({(formData.mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="thumbnailFile">Custom Thumbnail (Max 10MB)</Label>
              <Input
                id="thumbnailFile"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("thumbnailFile", e.target.files?.[0] || null)}
              />
              {formData.thumbnailFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {formData.thumbnailFile.name} ({(formData.thumbnailFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {/* Monetization */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monetization
            </h3>

            <div>
              <Label htmlFor="redirectLink">Redirect Link</Label>
              <Input
                id="redirectLink"
                value={formData.redirectLink}
                onChange={(e) => handleInputChange("redirectLink", e.target.value)}
                placeholder="https://example.com (for Skip Ad button)"
              />
            </div>

            <div>
              <Label htmlFor="popunderAd">Popunder Ad Code</Label>
              <Textarea
                id="popunderAd"
                value={formData.popunderAd}
                onChange={(e) => handleInputChange("popunderAd", e.target.value)}
                placeholder="Paste your popunder ad script tag here"
                rows={3}
              />
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">{uploadProgress}</span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadProgress || "Generating Post..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Generate Social Media Post
                </>
              )}
            </Button>

            <Button type="button" variant="outline" onClick={clearForm} disabled={isLoading}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
