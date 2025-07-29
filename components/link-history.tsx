"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Copy, Trash2, ExternalLink, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase, type GeneratedLink } from "@/lib/supabase"
import { formatTimeAgo, copyToClipboard } from "@/lib/utils"

export default function LinkHistory() {
  const [links, setLinks] = useState<GeneratedLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_links")
        .select(`
          *,
          posts (
            title,
            description,
            created_at
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setLinks(data || [])
    } catch (error) {
      console.error("Error fetching links:", error)
      toast({
        title: "Error",
        description: "Failed to load link history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (linkId: string) => {
    const url = `${window.location.origin}/post/${linkId}`
    const success = await copyToClipboard(url)

    if (success) {
      setCopiedId(linkId)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (linkId: string, postId: string) => {
    try {
      // Delete the generated link (this will cascade delete the post due to foreign key)
      const { error } = await supabase.from("generated_links").delete().eq("id", linkId)

      if (error) throw error

      // Also delete the post
      await supabase.from("posts").delete().eq("id", postId)

      setLinks((prev) => prev.filter((link) => link.id !== linkId))
      toast({
        title: "Deleted",
        description: "Link and post deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting link:", error)
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      })
    }
  }

  const handleVisit = (linkId: string) => {
    window.open(`/post/${linkId}`, "_blank")
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading link history...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Link History
        </CardTitle>
        <CardDescription>Manage your generated social media posts</CardDescription>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No links generated yet. Create your first social media post above!
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{link.title || "Untitled Post"}</h3>
                    <Badge variant="secondary" className="text-xs">
                      /{link.link_id}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Created {formatTimeAgo(link.created_at)}</p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => handleVisit(link.link_id)}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => handleCopy(link.link_id)}>
                    {copiedId === link.link_id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(link.id, link.post_id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
