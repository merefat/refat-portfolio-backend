const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

const router = express.Router();

// Real-time subscription for visitor analytics
let visitorSubscription = null;

/**
 * POST /api/visit/subscribe
 * Subscribe to real-time visitor updates (protected)
 */
router.post('/visit/subscribe', authenticateToken, async (req, res) => {
  try {
    // Close existing subscription if any
    if (visitorSubscription) {
      visitorSubscription.unsubscribe();
    }

    // Subscribe to visitor table changes
    visitorSubscription = supabase
      .channel('visitor-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitors' }, (payload) => {
        console.log('New visitor:', payload.new);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to visitor updates');
        }
      });

    res.json({ 
      success: true, 
      message: 'Subscribed to visitor updates' 
    });
  } catch (error) {
    console.error('Error subscribing to visitor updates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error subscribing to updates' 
    });
  }
});

/**
 * POST /api/visit/unsubscribe
 * Unsubscribe from visitor updates (protected)
 */
router.post('/visit/unsubscribe', authenticateToken, async (req, res) => {
  try {
    if (visitorSubscription) {
      visitorSubscription.unsubscribe();
      visitorSubscription = null;
    }

    res.json({ 
      success: true, 
      message: 'Unsubscribed from visitor updates' 
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error unsubscribing' 
    });
  }
});

/**
 * POST /api/visit
 * Track visitor (public)
 */
router.post('/visit', async (req, res) => {
  try {
    const { userAgent, page, ip, country, city } = req.body;

    const { error } = await supabase
      .from('visitors')
      .insert({
        ip: ip || req.ip || 'unknown',
        user_agent: userAgent || 'Unknown',
        page: page || '/',
        timestamp: new Date().toISOString(),
        country: country || null,
        city: city || null
      });

    if (error) {
      console.error('Error tracking visitor:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error tracking visitor' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Visitor tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error tracking visitor' 
    });
  }
});

/**
 * GET /api/analytics
 * Get visitor analytics (protected)
 */
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { data: visits, error } = await supabase
      .from('visitors')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error reading analytics:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error reading analytics' 
      });
    }

    const totalVisitors = visits.length;
    const uniqueVisitors = new Set(visits.map(v => v.ip)).size;
    
    // Calculate page breakdown
    const pageBreakdown = {};
    visits.forEach(visit => {
      const page = visit.page || '/';
      pageBreakdown[page] = (pageBreakdown[page] || 0) + 1;
    });

    res.json({ 
      success: true, 
      analytics: {
        totalVisitors,
        uniqueVisitors,
        pageBreakdown,
        recentVisits: visits.slice(0, 10) // Last 10 visits
      }
    });
  } catch (error) {
    console.error('Error reading analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading analytics' 
    });
  }
});

module.exports = router;
