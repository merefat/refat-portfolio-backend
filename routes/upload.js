const express = require('express');
const multer = require('multer');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage (for Supabase upload)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only (JPG, PNG, WEBP)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * POST /api/upload
 * Upload image to Supabase Storage (protected)
 */
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const { type } = req.body; // 'projects', 'blog', 'profile', 'experience', 'logo', 'about'
    
    if (!type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type parameter is required (e.g., projects, blog, profile, experience, logo, about)' 
      });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = req.file.originalname.split('.').pop();
    const filename = `${type}-${timestamp}-${random}.${ext}`;
    const filePath = `${type}/${filename}`;

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Error uploading to Supabase:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error uploading image' 
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(filePath);

    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      imageUrl: publicUrl,
      type
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading image' 
    });
  }
});

/**
 * POST /api/upload/resume
 * Upload resume PDF to Supabase Storage (protected)
 */
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = req.file.originalname.split('.').pop();
    const filename = `resume-${timestamp}-${random}.${ext}`;
    const filePath = `resume/${filename}`;

    // Upload to Supabase Storage using admin client (bypasses RLS)
    // Using the existing 'images' bucket with 'resume' folder
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Error uploading to Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading resume'
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(filePath);

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl: publicUrl
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume'
    });
  }
});

module.exports = router;
