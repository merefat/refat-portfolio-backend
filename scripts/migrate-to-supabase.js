require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

const readJSON = (filename) => {
  const filePath = path.join(__dirname, '../data', filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return null;
};

const migrateContent = async () => {
  console.log('Migrating Content...');
  
  const sections = ['home', 'about', 'skills', 'contact'];
  
  for (const section of sections) {
    const data = readJSON(`${section}.json`);
    if (data) {
      const { error } = await supabaseAdmin
        .from('content')
        .upsert({ section, data }, { onConflict: 'section' });
      
      if (error) {
        console.error(`Error migrating ${section}:`, error);
      } else {
        console.log(`✓ Migrated ${section}`);
      }
    }
  }
};

const migrateBlogs = async () => {
  console.log('Migrating Blogs...');
  
  const blogData = readJSON('blog.json');
  if (blogData && blogData.posts) {
    for (const post of blogData.posts) {
      const { error } = await supabaseAdmin
        .from('blogs')
        .upsert({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          image: post.image,
          date: post.date,
          read_time: post.readTime,
          category: post.category,
          status: post.status
        });
      
      if (error) {
        console.error(`Error migrating blog "${post.title}":`, error);
      }
    }
    console.log(`✓ Migrated ${blogData.posts.length} blog posts`);
  }
};

const migrateProjects = async () => {
  console.log('Migrating Projects...');
  
  const projectData = readJSON('projects.json');
  if (projectData && projectData.projects) {
    for (const project of projectData.projects) {
      const { error } = await supabaseAdmin
        .from('projects')
        .upsert({
          title: project.title,
          description: project.description,
          image: project.image,
          live_url: project.liveUrl,
          github_url: project.githubUrl,
          tags: project.tags
        });
      
      if (error) {
        console.error(`Error migrating project "${project.title}":`, error);
      }
    }
    console.log(`✓ Migrated ${projectData.projects.length} projects`);
  }
};

const migrateMessages = async () => {
  console.log('Migrating Messages...');
  
  const messageData = readJSON('messages.json');
  if (messageData && messageData.messages) {
    for (const message of messageData.messages) {
      const { error } = await supabaseAdmin
        .from('messages')
        .insert({
          name: message.name,
          email: message.email,
          subject: message.subject,
          message: message.message,
          read: message.read,
          created_at: message.timestamp
        });
      
      if (error) {
        console.error(`Error migrating message:`, error);
      }
    }
    console.log(`✓ Migrated ${messageData.messages.length} messages`);
  }
};

const migrateVisitors = async () => {
  console.log('Migrating Visitors...');
  
  const visitorData = readJSON('visitors.json');
  if (visitorData && visitorData.visits) {
    for (const visit of visitorData.visits) {
      const { error } = await supabaseAdmin
        .from('visitors')
        .insert({
          ip: visit.ip || 'unknown',
          user_agent: visit.userAgent,
          page: visit.page || '/',
          timestamp: visit.timestamp,
          country: visit.country,
          city: visit.city
        });
      
      if (error) {
        console.error(`Error migrating visitor:`, error);
      }
    }
    console.log(`✓ Migrated ${visitorData.visits.length} visitors`);
  }
};

const createAdminUser = async () => {
  console.log('Creating admin user...');
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: process.env.ADMIN_USERNAME || 'admin@portfolio.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    email_confirm: true
  });
  
  if (error) {
    if (error.message.includes('already registered')) {
      console.log('✓ Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  } else {
    console.log('✓ Created admin user');
    console.log('  Email:', process.env.ADMIN_USERNAME || 'admin@portfolio.com');
    console.log('  Password:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('  ⚠ Please change the default password after first login!');
  }
};

const runMigration = async () => {
  console.log('Starting Supabase migration...\n');
  
  try {
    await migrateContent();
    await migrateBlogs();
    await migrateProjects();
    await migrateMessages();
    await migrateVisitors();
    await createAdminUser();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update server.js to load environment variables');
    console.log('2. Update auth routes to use Supabase Auth');
    console.log('3. Update all routes to use Supabase client');
    console.log('4. Update upload routes to use Supabase Storage');
    console.log('5. Test the application');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  }
};

runMigration();
