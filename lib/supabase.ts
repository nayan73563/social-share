import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://wmizvklxfdxmwuocnadq.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtaXp2a2x4ZmR4bXd1b2NuYWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NzkxMjcsImV4cCI6MjA2OTI1NTEyN30.4Wtmxht2tZxRuuOEozqO3-f_dXZ_IfyzkBzIGXvPMks"

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Post {
  id: string
  title?: string
  description?: string
  embed_code?: string
  video_url?: string
  media_url?: string
  media_type?: string
  thumbnail_url?: string
  redirect_link?: string
  popunder_ad?: string
  created_at: string
}

export interface GeneratedLink {
  id: string
  post_id: string
  link_id: string
  title?: string
  created_at: string
  posts?: Post
}
