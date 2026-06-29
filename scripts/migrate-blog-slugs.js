/**
 * Migration Script: Generate Slugs for Existing Blog Posts
 * Run this after adding the slug column to the blogs table
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { supabaseAdmin } = require('../config/supabase');
const { generateUniqueSlug } = require('../utils/slugGenerator');

async function migrateBlogSlugs() {
  try {
    console.log('Starting blog slug migration...');

    // Fetch all blog posts without slugs
    const { data: posts, error: fetchError } = await supabaseAdmin
      .from('blogs')
      .select('id, title, slug')
      .is('slug', null);

    if (fetchError) {
      console.error('Error fetching blog posts:', fetchError);
      process.exit(1);
    }

    if (!posts || posts.length === 0) {
      console.log('No blog posts found without slugs. Migration complete.');
      process.exit(0);
    }

    console.log(`Found ${posts.length} blog posts without slugs.`);

    // Fetch all existing slugs to ensure uniqueness
    const { data: allPosts } = await supabaseAdmin
      .from('blogs')
      .select('slug')
      .not('slug', 'is', null);

    const existingSlugs = allPosts ? allPosts.map(p => p.slug) : [];

    // Generate and update slugs for each post
    let successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        const uniqueSlug = generateUniqueSlug(post.title, existingSlugs);
        
        const { error: updateError } = await supabaseAdmin
          .from('blogs')
          .update({ slug: uniqueSlug })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Error updating post ${post.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`✓ Updated post "${post.title}" with slug: ${uniqueSlug}`);
          existingSlugs.push(uniqueSlug);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
        errorCount++;
      }
    }

    console.log('\nMigration complete!');
    console.log(`Success: ${successCount} posts`);
    console.log(`Errors: ${errorCount} posts`);

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateBlogSlugs();
