const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const router = express.Router();

/**
 * GET /api/experiences
 * Get all experiences ordered by display_order
 */
router.get('/', async (req, res) => {
  try {
    console.log('[EXPERIENCES GET] Fetching all experiences');
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('[EXPERIENCES GET] Supabase error:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching experiences',
        error: error.message 
      });
    }

    console.log('[EXPERIENCES GET] Successfully fetched experiences:', data?.length || 0);
    console.log('[EXPERIENCES GET] Data:', JSON.stringify(data, null, 2));
    res.json({ 
      success: true, 
      data: data || []
    });
  } catch (error) {
    console.error('[EXPERIENCES GET] Error reading experiences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading experiences' 
    });
  }
});

/**
 * POST /api/experiences
 * Create new experience (admin only)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('[EXPERIENCES POST] Request body:', JSON.stringify(req.body, null, 2));
    console.log('[EXPERIENCES POST] Auth headers:', req.headers.authorization ? 'Present' : 'Missing');
    
    const {
      company_name,
      role,
      start_date,
      end_date,
      company_logo,
      description,
      achievements,
      technologies,
      display_order
    } = req.body;

    // Validate required fields
    if (!company_name || !role || !start_date || !description) {
      console.log('[EXPERIENCES POST] Validation failed. Missing fields:', {
        company_name: !!company_name,
        role: !!role,
        start_date: !!start_date,
        description: !!description
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: company_name, role, start_date, description' 
      });
    }

    // Get the highest display_order if not provided
    let finalDisplayOrder = display_order;
    if (finalDisplayOrder === undefined || finalDisplayOrder === null) {
      const { data: existingExperiences } = await supabase
        .from('experiences')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      
      finalDisplayOrder = existingExperiences && existingExperiences.length > 0 
        ? existingExperiences[0].display_order + 1 
        : 0;
    }

    console.log('[EXPERIENCES POST] Attempting to insert into Supabase:', {
      company_name,
      role,
      start_date,
      end_date,
      company_logo,
      display_order: finalDisplayOrder
    });

    const { data, error } = await supabaseAdmin
      .from('experiences')
      .insert({
        company_name,
        role,
        start_date,
        end_date: end_date || null,
        company_logo: company_logo || null,
        description,
        achievements: achievements || [],
        technologies: technologies || [],
        display_order: finalDisplayOrder
      })
      .select()
      .single();

    if (error) {
      console.error('[EXPERIENCES POST] Supabase error:', JSON.stringify(error, null, 2));
      console.error('[EXPERIENCES POST] Error code:', error.code);
      console.error('[EXPERIENCES POST] Error message:', error.message);
      console.error('[EXPERIENCES POST] Error details:', error.details);
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating experience',
        error: error.message,
        code: error.code,
        details: error.details
      });
    }

    console.log('[EXPERIENCES POST] Successfully created experience:', data);

    res.json({ 
      success: true, 
      message: 'Experience created successfully',
      data: data
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating experience' 
    });
  }
});

/**
 * PUT /api/experiences/:id
 * Update experience (admin only)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      role,
      start_date,
      end_date,
      company_logo,
      description,
      achievements,
      technologies,
      display_order
    } = req.body;

    const updateData = {};
    if (company_name !== undefined) updateData.company_name = company_name;
    if (role !== undefined) updateData.role = role;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (company_logo !== undefined) updateData.company_logo = company_logo;
    if (description !== undefined) updateData.description = description;
    if (achievements !== undefined) updateData.achievements = achievements;
    if (technologies !== undefined) updateData.technologies = technologies;
    if (display_order !== undefined) updateData.display_order = display_order;

    console.log('[EXPERIENCES PUT] Updating experience with ID:', id);
    console.log('[EXPERIENCES PUT] Update data:', JSON.stringify(updateData, null, 2));

    const { data, error } = await supabaseAdmin
      .from('experiences')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    console.log('[EXPERIENCES PUT] Supabase response:', {
      data: data ? 'Data present' : 'No data',
      error: error ? error.message : 'No error',
      rowCount: data ? 1 : 0
    });

    if (error) {
      console.error('Error updating experience:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating experience',
        error: error.message 
      });
    }

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Experience not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Experience updated successfully',
      data: data
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating experience' 
    });
  }
});

/**
 * DELETE /api/experiences/:id
 * Delete experience (admin only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('experiences')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting experience:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error deleting experience',
        error: error.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting experience' 
    });
  }
});

/**
 * PUT /api/experiences/reorder
 * Reorder experiences (admin only)
 */
router.put('/reorder', authenticateToken, async (req, res) => {
  try {
    const { experiences } = req.body;

    if (!Array.isArray(experiences)) {
      return res.status(400).json({ 
        success: false, 
        message: 'experiences must be an array' 
      });
    }

    // Update each experience's display_order
    const updates = experiences.map((exp, index) => 
      supabaseAdmin
        .from('experiences')
        .update({ display_order: index })
        .eq('id', exp.id)
    );

    await Promise.all(updates);

    res.json({ 
      success: true, 
      message: 'Experiences reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering experiences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reordering experiences' 
    });
  }
});

module.exports = router;
