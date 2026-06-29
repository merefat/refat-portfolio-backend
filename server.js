require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const projectsRoutes = require('./routes/projects');
const blogRoutes = require('./routes/blog');
const messagesRoutes = require('./routes/messages');
const visitorsRoutes = require('./routes/visitors');
const uploadRoutes = require('./routes/upload');
const experiencesRoutes = require('./routes/experiences');

const app = express();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please set these in your Vercel project settings');
}

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']
  : true;

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api', messagesRoutes);
app.use('/api', visitorsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/experiences', experiencesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const envStatus = {
    jwtSecret: !!process.env.JWT_SECRET,
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    port: process.env.PORT || 5000
  };
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: envStatus
  });
});

// Root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      admin: '/api/admin',
      content: '/api/content',
      projects: '/api/projects',
      blog: '/api/blog',
      contact: '/api/contact',
      messages: '/api/messages',
      upload: '/api/upload',
      experiences: '/api/experiences'
    }
  });
});

// Catch-all route for undefined paths
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    availableEndpoints: [
      '/api/health',
      '/api/admin/login',
      '/api/content/:section',
      '/api/projects',
      '/api/blog',
      '/api/contact',
      '/api/messages',
      '/api/upload',
      '/api/experiences'
    ]
  });
});

// Start server only when not running on Vercel (serverless)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
