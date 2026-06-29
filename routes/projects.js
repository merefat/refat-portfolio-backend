const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const router = express.Router();

/**
 * GET /api/projects
 * Get all projects
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error reading projects:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error reading projects' 
      });
    }

    res.json({ 
      success: true, 
      projects: data 
    });
  } catch (error) {
    console.error('Error reading projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading projects' 
    });
  }
});

/**
 * POST /api/projects
 * Create new project (protected)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, image, liveUrl, githubUrl, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and description are required' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        title,
        description,
        image: image || '',
        live_url: liveUrl || '',
        github_url: githubUrl || '',
        tags: tags || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating project' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Project created successfully',
      project: data
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating project' 
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update project (protected)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, liveUrl, githubUrl, tags } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (liveUrl !== undefined) updateData.live_url = liveUrl;
    if (githubUrl !== undefined) updateData.github_url = githubUrl;
    if (tags !== undefined) updateData.tags = tags;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error updating project:', error);
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Project updated successfully',
      project: data
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating project' 
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project (protected)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting project' 
    });
  }
});

module.exports = router;
