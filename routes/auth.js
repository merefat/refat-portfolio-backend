const express = require('express');
const { supabase } = require('../config/supabase');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/admin/login
 * Login with email/password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    console.log('Login attempt for email:', email);

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Supabase credentials not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error: Supabase not configured' 
      });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('Supabase auth error:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: error.message || 'Invalid credentials' 
      });
    }

    console.log('Supabase auth successful for:', data.user.email);

    // Generate JWT token for backend API
    const token = generateToken({ email: data.user.email });

    if (!token) {
      console.error('Failed to generate JWT token');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate authentication token' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: { email: data.user.email },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login: ' + error.message 
    });
  }
});

module.exports = router;
