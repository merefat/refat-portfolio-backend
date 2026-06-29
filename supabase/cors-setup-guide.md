# CORS Configuration Guide for Supabase

## Step 1: Run Storage Setup SQL

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `backend/supabase/storage-setup.sql`
5. Click **Run** to execute the script

This will:
- Ensure the `images` bucket is set to public
- Create proper storage policies for public read access
- Allow authenticated users to upload/update/delete images

## Step 2: Configure CORS in Supabase Dashboard

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. Scroll down to **Additional Settings**
4. Find **CORS allowed origins**
5. Add your frontend URLs:
   - For local development: `http://localhost:3000` (or your frontend port)
   - For production: `https://your-domain.com`
6. Click **Save**

## Step 3: Verify Bucket is Public

1. Go to **Storage** in the left sidebar
2. Click on the `images` bucket
3. Ensure the **Public bucket** toggle is **ON**
4. If it's OFF, toggle it ON

## Step 4: Test the Fix

1. Go to your admin panel
2. Navigate to About section
3. Upload a new image (or re-upload existing one)
4. Save the content
5. Go to the user panel About section
6. Verify the image displays correctly

## Troubleshooting

If images still don't load:

1. **Check the image URL directly in browser**
   - Get the image URL from the database (Supabase Dashboard → Table Editor → content → section='about')
   - Paste the URL in a new browser tab
   - If it doesn't load, the bucket is not properly configured

2. **Check browser console for errors**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for any CORS or 403 errors

3. **Verify storage policies**
   - Go to Storage → images → Policies
   - Ensure "Public can view images" policy exists and is active

4. **Clear browser cache**
   - Sometimes cached CORS policies cause issues
   - Clear cache and reload the page
