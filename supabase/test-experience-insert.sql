-- Test Experience Creation via Direct SQL Insert
-- Run this in Supabase SQL Editor to test if the database allows experience creation
-- This bypasses the API and frontend to isolate database-level issues

INSERT INTO experiences (
  company_name,
  role,
  start_date,
  end_date,
  company_logo,
  description,
  achievements,
  technologies,
  display_order
) VALUES (
  'Test Company',
  'Test Role',
  '2024',
  'Present',
  'https://clickbit.com.au/logo.svg',
  'Test description for experience to verify database insert works',
  ARRAY['Achievement 1', 'Achievement 2'],
  ARRAY['React', 'Node.js'],
  0
);

-- After running, check if the insert was successful by running:
-- SELECT * FROM experiences WHERE company_name = 'Test Company';
