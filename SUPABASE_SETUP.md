# Supabase Setup Instructions

## Step 1: Install Dependencies
Run the following command in the backend directory:
```bash
npm install
```

## Step 2: Set Up Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a free account
3. Create a new project
4. Wait for the project to be ready (2-3 minutes)

## Step 3: Get Supabase Credentials
1. Go to Project Settings → API
2. Copy the following:
   - **Project URL** (SUPABASE_URL)
   - **anon public key** (SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!
   - **JWT Secret** (SUPABASE_JWT_SECRET) - Keep this secret!

## Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and replace the placeholders with your actual Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

## Step 5: Set Up Database Tables
1. Go to the Supabase SQL Editor
2. Run the SQL script from `supabase/setup.sql`
3. This will create all required tables (content, blogs, projects, messages, visitors)

## Step 6: Configure Row Level Security
1. In the SQL Editor, run the script from `supabase/rls-policies.sql`
2. This will set up security policies for data access

## Step 7: Set Up Storage Bucket
1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `images`
3. Make it public
4. Run the SQL script from `supabase/storage-setup.sql` to set up storage policies

## Step 8: Run Migration Script
Import your existing JSON data into Supabase:
```bash
node scripts/migrate-to-supabase.js
```

This will:
- Import all content sections (home, about, skills, contact)
- Import blog posts
- Import projects
- Import messages
- Import visitor data
- Create admin user in Supabase Auth

**Note**: The default admin credentials are set in your `.env` file. Change them after first login!

## Step 9: Start the Server
```bash
npm start
```

The server will now use Supabase for all data operations.

## Features Implemented

### ✅ Supabase Auth
- Email/password authentication
- JWT token generation
- Secure session management

### ✅ Database Operations
- All CRUD operations using Supabase client
- Content management (home, about, skills, contact)
- Blog posts with draft/published status
- Projects with tags and links
- Contact messages
- Visitor tracking

### ✅ File Storage
- Image uploads to Supabase Storage
- Public URL generation
- Organized by type (projects, blog, profile)

### ✅ Row Level Security
- Public read access for published content
- Authenticated write access for admin operations
- Public insert for messages and visitors
- Admin-only access to analytics

### ✅ Real-time Features
- Live visitor tracking
- Real-time analytics updates
- Subscription endpoints for live data

## API Endpoints

### Authentication
- `POST /api/admin/login` - Login with email/password

### Content
- `GET /api/content/:section` - Get section content
- `PUT /api/content/:section` - Update section content (auth required)

### Blogs
- `GET /api/blog` - Get all published blogs
- `POST /api/blog` - Create blog post (auth required)
- `PUT /api/blog/:id` - Update blog post (auth required)
- `DELETE /api/blog/:id` - Delete blog post (auth required)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (auth required)
- `PUT /api/projects/:id` - Update project (auth required)
- `DELETE /api/projects/:id` - Delete project (auth required)

### Messages
- `POST /api/contact` - Submit contact form (public)
- `GET /api/messages` - Get all messages (auth required)
- `PUT /api/messages/:id/read` - Mark as read (auth required)
- `DELETE /api/messages/:id` - Delete message (auth required)

### Visitors & Analytics
- `POST /api/visit` - Track visitor (public)
- `GET /api/analytics` - Get analytics (auth required)
- `POST /api/visit/subscribe` - Subscribe to real-time updates (auth required)
- `POST /api/visit/unsubscribe` - Unsubscribe from updates (auth required)

### Upload
- `POST /api/upload` - Upload image to Supabase Storage (auth required)

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and keys in `.env`
- Check that your Supabase project is active
- Ensure your IP is not blocked (if using IP restrictions)

### Migration Errors
- Ensure all SQL scripts have been run
- Check that the storage bucket exists
- Verify your admin credentials in `.env`

### Authentication Issues
- Ensure the admin user was created during migration
- Check that Supabase Auth is enabled
- Verify JWT secret matches your Supabase project

### Storage Issues
- Ensure the `images` bucket exists and is public
- Check storage policies are applied
- Verify file size limits (5MB)

## Next Steps
- Change default admin password
- Test all CRUD operations in the admin panel
- Verify real-time subscriptions work
- Monitor Supabase dashboard for usage
- Set up backups if needed
