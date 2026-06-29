-- Add Experiences Table Migration
-- Run this in your Supabase SQL Editor to add the experiences table to an existing database

-- Create experiences table (if not exists)
CREATE TABLE IF NOT EXISTS experiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  start_date VARCHAR(50) NOT NULL,
  end_date VARCHAR(50),
  company_logo TEXT,
  description TEXT NOT NULL,
  achievements TEXT[] NOT NULL,
  technologies TEXT[] NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for experiences
CREATE INDEX IF NOT EXISTS idx_experiences_display_order ON experiences(display_order);

-- Enable Row Level Security for experiences
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
