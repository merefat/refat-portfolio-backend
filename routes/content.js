const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const router = express.Router();

const SECTIONS = ['home', 'about', 'skills', 'contact', 'settings', 'messagebot'];

/**
 * GET /api/content/:section
 * Get specific section content
 */
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;

    if (!SECTIONS.includes(section)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid section' 
      });
    }

    const { data, error } = await supabase
      .from('content')
      .select('data')
      .eq('section', section)
      .single();
    
    if (error) {
      return res.status(404).json({ 
        success: false, 
        message: 'Section not found' 
      });
    }

    res.json({ 
      success: true, 
      data: data.data 
    });
  } catch (error) {
    console.error('Error reading content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading content' 
    });
  }
});

/**
 * PUT /api/content/:section
 * Update specific section content (protected)
 */
router.put('/:section', authenticateToken, async (req, res) => {
  try {
    const { section } = req.params;
    const content = req.body;

    if (!SECTIONS.includes(section)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid section' 
      });
    }

    if (!content || typeof content !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid content data' 
      });
    }

    console.log(`Updating content section: ${section} using supabaseAdmin...`);
    const { data, error } = await supabaseAdmin
      .from('content')
      .upsert({ section, data: content }, { onConflict: 'section' });

    if (error) {
      console.error('Error updating content:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating content' 
      });
    }

    console.log(`Content section ${section} updated successfully`);
    res.json({ 
      success: true, 
      message: `${section} updated successfully`,
      data: content
    });
  } catch (error) {
    console.error('Error writing content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating content' 
    });
  }
});

module.exports = router;
