-- Add tables for real user interactions

-- Table for post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for post comments  
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for post shares
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);

-- Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on post_likes" ON post_likes FOR ALL USING (true);
CREATE POLICY "Allow all operations on post_comments" ON post_comments FOR ALL USING (true);
CREATE POLICY "Allow all operations on post_shares" ON post_shares FOR ALL USING (true);
