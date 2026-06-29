const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { generateUniqueSlug, calculateReadingTime } = require('../utils/slugGenerator');

const router = express.Router();

/**
 * GET /api/blog
 * Get all blog posts
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error reading blog posts:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error reading blog posts' 
      });
    }

    res.json({ 
      success: true, 
      posts: data 
    });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading blog posts' 
    });
  }
});

/**
 * GET /api/blog/:slug
 * Get a single blog post by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    
    if (error) {
      console.error('Error reading blog post:', error);
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }

    res.json({ 
      success: true, 
      post: data 
    });
  } catch (error) {
    console.error('Error reading blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading blog post' 
    });
  }
});

/**
 * POST /api/blog
 * Create new blog post (protected)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, excerpt, content, image, date, readTime, category, status } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, excerpt, and content are required' 
      });
    }

    // Fetch existing slugs to ensure uniqueness
    const { data: allPosts } = await supabaseAdmin
      .from('blogs')
      .select('slug');
    const existingSlugs = allPosts ? allPosts.map(p => p.slug).filter(Boolean) : [];

    // Generate unique slug
    const slug = generateUniqueSlug(title, existingSlugs);

    // Calculate reading time if not provided
    const calculatedReadTime = readTime || calculateReadingTime(content);

    const { data, error } = await supabaseAdmin
      .from('blogs')
      .insert({
        title,
        excerpt,
        content,
        image: image || '',
        slug,
        date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        read_time: calculatedReadTime,
        category: category || 'General',
        status: status || 'published'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating blog post' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Blog post created successfully',
      post: data
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating blog post' 
    });
  }
});

/**
 * PUT /api/blog/:id
 * Update blog post (protected)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, image, date, readTime, category, status, regenerateSlug } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (excerpt) updateData.excerpt = excerpt;
    if (content) updateData.content = content;
    if (image !== undefined) updateData.image = image;
    if (date) updateData.date = date;
    if (readTime) updateData.read_time = readTime;
    if (category) updateData.category = category;
    if (status !== undefined) updateData.status = status;

    // Regenerate slug only if explicitly requested
    if (regenerateSlug && title) {
      const { data: allPosts } = await supabaseAdmin
        .from('blogs')
        .select('slug')
        .neq('id', id);
      const existingSlugs = allPosts ? allPosts.map(p => p.slug).filter(Boolean) : [];
      updateData.slug = generateUniqueSlug(title, existingSlugs);
    }

    const { data, error } = await supabaseAdmin
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating blog post:', error);
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Blog post updated successfully',
      post: data
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating blog post' 
    });
  }
});

/**
 * DELETE /api/blog/:id
 * Delete blog post (protected)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('blogs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting blog post:', error);
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Blog post deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting blog post' 
    });
  }
});

module.exports = router;
