import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateLinkId = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const formatTimeAgo = (date: string): string => {
  const now = new Date()
  const postDate = new Date(date)
  const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}

export const generateRandomStats = () => ({
  likes: Math.floor(Math.random() * 10000) + 100,
  comments: Math.floor(Math.random() * 500) + 10, // This will be overridden in post-view for fake comments
  shares: Math.floor(Math.random() * 1000) + 5,
  views: Math.floor(Math.random() * 100000) + 1000,
})

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    return false
  }
}
