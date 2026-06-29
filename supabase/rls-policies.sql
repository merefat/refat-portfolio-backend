-- Row Level Security Policies for Portfolio Website
-- Run this in your Supabase SQL Editor after creating tables

-- CONTENT TABLE POLICIES
-- Public can read all content
DROP POLICY IF EXISTS "Content is publicly viewable" ON content;
CREATE POLICY "Content is publicly viewable" 
ON content FOR SELECT 
USING (true);

-- Only authenticated users can update content
DROP POLICY IF EXISTS "Authenticated users can update content" ON content;
CREATE POLICY "Authenticated users can update content" 
ON content FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Only authenticated users can insert content
DROP POLICY IF EXISTS "Authenticated users can insert content" ON content;
CREATE POLICY "Authenticated users can insert content" 
ON content FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- BLOGS TABLE POLICIES
-- Public can read published blogs
DROP POLICY IF EXISTS "Published blogs are publicly viewable" ON blogs;
CREATE POLICY "Published blogs are publicly viewable" 
ON blogs FOR SELECT 
USING (status = 'published');

-- Authenticated users can read all blogs (including drafts)
DROP POLICY IF EXISTS "Authenticated users can view all blogs" ON blogs;
CREATE POLICY "Authenticated users can view all blogs" 
ON blogs FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only authenticated users can insert blogs
DROP POLICY IF EXISTS "Authenticated users can insert blogs" ON blogs;
CREATE POLICY "Authenticated users can insert blogs" 
ON blogs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update blogs
DROP POLICY IF EXISTS "Authenticated users can update blogs" ON blogs;
CREATE POLICY "Authenticated users can update blogs" 
ON blogs FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete blogs
DROP POLICY IF EXISTS "Authenticated users can delete blogs" ON blogs;
CREATE POLICY "Authenticated users can delete blogs" 
ON blogs FOR DELETE 
USING (auth.role() = 'authenticated');

-- PROJECTS TABLE POLICIES
-- Public can read all projects
DROP POLICY IF EXISTS "Projects are publicly viewable" ON projects;
CREATE POLICY "Projects are publicly viewable" 
ON projects FOR SELECT 
USING (true);

-- Only authenticated users can insert projects
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
CREATE POLICY "Authenticated users can insert projects" 
ON projects FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update projects
DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
CREATE POLICY "Authenticated users can update projects" 
ON projects FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete projects
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;
CREATE POLICY "Authenticated users can delete projects" 
ON projects FOR DELETE 
USING (auth.role() = 'authenticated');

-- MESSAGES TABLE POLICIES
-- Public can insert messages (contact form)
DROP POLICY IF EXISTS "Public can insert messages" ON messages;
CREATE POLICY "Public can insert messages" 
ON messages FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can read messages
DROP POLICY IF EXISTS "Authenticated users can read messages" ON messages;
CREATE POLICY "Authenticated users can read messages" 
ON messages FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only authenticated users can update messages (mark as read)
DROP POLICY IF EXISTS "Authenticated users can update messages" ON messages;
CREATE POLICY "Authenticated users can update messages" 
ON messages FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete messages
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON messages;
CREATE POLICY "Authenticated users can delete messages" 
ON messages FOR DELETE 
USING (auth.role() = 'authenticated');

-- VISITORS TABLE POLICIES
-- Public can insert visitor data
DROP POLICY IF EXISTS "Public can insert visitors" ON visitors;
CREATE POLICY "Public can insert visitors" 
ON visitors FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can read visitor data (analytics)
DROP POLICY IF EXISTS "Authenticated users can read visitors" ON visitors;
CREATE POLICY "Authenticated users can read visitors" 
ON visitors FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete visitor data
DROP POLICY IF EXISTS "Authenticated users can delete visitors" ON visitors;
CREATE POLICY "Authenticated users can delete visitors" 
ON visitors FOR DELETE 
USING (auth.role() = 'authenticated');

-- EXPERIENCES TABLE POLICIES
-- Public can read all experiences
DROP POLICY IF EXISTS "Experiences are publicly viewable" ON experiences;
CREATE POLICY "Experiences are publicly viewable" 
ON experiences FOR SELECT 
USING (true);

-- Only authenticated users can insert experiences
DROP POLICY IF EXISTS "Authenticated users can insert experiences" ON experiences;
CREATE POLICY "Authenticated users can insert experiences" 
ON experiences FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update experiences
DROP POLICY IF EXISTS "Authenticated users can update experiences" ON experiences;
CREATE POLICY "Authenticated users can update experiences" 
ON experiences FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete experiences
DROP POLICY IF EXISTS "Authenticated users can delete experiences" ON experiences;
CREATE POLICY "Authenticated users can delete experiences" 
ON experiences FOR DELETE 
USING (auth.role() = 'authenticated');

-- Grant table privileges to authenticated role for experiences
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;

-- Grant table privileges to anon role for experiences (for service role access)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO anon;

-- Grant table privileges for messages table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO service_role;

-- Grant table privileges for blogs table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blogs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blogs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blogs TO service_role;

-- Grant table privileges for projects table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO service_role;

-- Grant table privileges for content table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content TO service_role;

-- Grant table privileges for visitors table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitors TO service_role;

-- Grant table privileges for experiences table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO service_role;

-- Enable real-time for tables (for live updates)
DO $$
BEGIN
  -- Add blogs if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'blogs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE blogs;
  END IF;

  -- Add visitors if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'visitors'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE visitors;
  END IF;

  -- Add messages if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;
