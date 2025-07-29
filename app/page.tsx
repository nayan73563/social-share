"use client"

import { useState } from "react"
import AuthGuard from "@/components/auth-guard"
import FormSection from "@/components/form-section"
import LinkHistory from "@/components/link-history"
import { useToast } from "@/hooks/use-toast"
import { copyToClipboard } from "@/lib/utils"

export default function HomePage() {
  const [refreshHistory, setRefreshHistory] = useState(0)
  const { toast } = useToast()

  const handleLinkGenerated = async (linkId: string) => {
    const url = `${window.location.origin}/post/${linkId}`
    const success = await copyToClipboard(url)

    if (success) {
      toast({
        title: "Link Generated & Copied!",
        description: `Your post is ready: /post/${linkId}`,
      })
    }

    // Refresh link history
    setRefreshHistory((prev) => prev + 1)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">Social Media Post Generator</h1>
          </div>

          <FormSection onLinkGenerated={handleLinkGenerated} />
          <LinkHistory key={refreshHistory} />
        </div>
      </div>
    </AuthGuard>
  )
}
