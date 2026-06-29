-- Add slug field to blogs table
-- Run this in your Supabase SQL Editor

-- Add slug column to blogs table
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Create index on slug for performance
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);

-- Add comment to document the field
COMMENT ON COLUMN blogs.slug IS 'URL-friendly slug generated from title, used for SEO-friendly URLs';
