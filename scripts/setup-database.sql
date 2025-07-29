-- Setup script for your Supabase database
-- Run this in your Supabase SQL editor

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  embed_code TEXT,
  video_url TEXT,
  media_url TEXT,
  media_type TEXT,
  thumbnail_url TEXT,
  redirect_link TEXT,
  popunder_ad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_links table
CREATE TABLE IF NOT EXISTS generated_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  link_id TEXT UNIQUE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_links_link_id ON generated_links(link_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_links_created_at ON generated_links(created_at DESC);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_links ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can restrict these later)
CREATE POLICY "Allow all operations on posts" ON posts FOR ALL USING (true);
CREATE POLICY "Allow all operations on generated_links" ON generated_links FOR ALL USING (true);

-- Insert some sample data for testing (optional)
INSERT INTO posts (title, description, redirect_link) VALUES 
('Sample Post', 'This is a sample social media post for testing', 'https://example.com');

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
