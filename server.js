require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

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
const PORT = process.env.PORT || 5000;

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
    port: process.env.PORT || 5000
  };
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: envStatus
  });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from frontend public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Start server only when not running on Vercel (serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
