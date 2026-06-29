-- Supabase Storage Setup for Resume PDFs
-- Run this in your Supabase SQL Editor

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true);

-- Storage Policies for Resumes Bucket
-- Public can read all resumes
CREATE POLICY "Public can view resumes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'resumes');

-- Authenticated users can upload resumes
CREATE POLICY "Authenticated users can upload resumes" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- Authenticated users can update resumes
CREATE POLICY "Authenticated users can update resumes" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- Authenticated users can delete resumes
CREATE POLICY "Authenticated users can delete resumes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');
