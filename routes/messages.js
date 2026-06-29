const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Fetch recipient email from settings (Supabase content table)
const getContactEmail = async () => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('data')
      .eq('section', 'settings')
      .single();

    if (!error && data && data.data && data.data.contactEmail) {
      return data.data.contactEmail;
    }
  } catch (err) {
    console.error('Error fetching settings email:', err);
  }
  return process.env.EMAIL_TO || '20103227@iubat.edu';
};

// Send email notification
const sendEmailNotification = async (data) => {
  try {
    const transporter = createTransporter();
    const recipientEmail = await getContactEmail();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: `New Contact Form Message: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <hr style="margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This message was sent from your portfolio contact form.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw error - we still want to save the message to database
  }
};

/**
 * POST /api/contact
 * Submit contact form (public)
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log('Contact form submission received:', { name, email, subject });

    if (!name || !email || !subject || !message) {
      console.error('Validation failed: missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    console.log('Attempting to insert message to Supabase using anon client...');
    const { data: insertData, error: insertError } = await supabase
      .from('messages')
      .insert({
        name,
        email,
        subject,
        message,
        read: false
      });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error sending message',
        error: insertError.message
      });
    }

    console.log('Message inserted successfully to Supabase');

    // Send email notification
    console.log('Sending email notification...');
    await sendEmailNotification({ name, email, subject, message });

    console.log('Contact form processed successfully');
    res.json({ 
      success: true, 
      message: 'Message sent successfully! I will get back to you soon.' 
    });
  } catch (error) {
    console.error('Unexpected error in contact form:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending message',
      error: error.message
    });
  }
});

/**
 * GET /api/messages
 * Get all messages (protected)
 */
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching messages for admin panel using supabaseAdmin...');
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error reading messages:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error reading messages' 
      });
    }

    console.log(`Successfully fetched ${data.length} messages`);
    res.json({ 
      success: true, 
      messages: data 
    });
  } catch (error) {
    console.error('Error reading messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading messages' 
    });
  }
});

/**
 * PUT /api/messages/:id/read
 * Mark message as read (protected)
 */
router.put('/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking message as read:', error);
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Message marked as read' 
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating message' 
    });
  }
});

/**
 * DELETE /api/messages/:id
 * Delete message (protected)
 */
router.delete('/messages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting message:', error);
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Message deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting message' 
    });
  }
});

module.exports = router;
