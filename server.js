import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Import routes
import adminRoutes from './src/routes/admin.routes.js';
import contentRoutes from './src/routes/content.routes.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: './src/.env' });

const app = express();
const PORT = process.env.PORT || 5000;

/* ============================
   CORS – ALLOW ALL ORIGINS
============================ */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: "*"
}));

app.options("*", cors());

// Cross-Origin-Resource-Policy fix
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// STATIC uploads exposure (BEFORE routes)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apju_media_hub';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);

// Debug: Log all routes
app.use('/api/content', (req, res, next) => {
  console.log(`🔍 Content API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'APJU Media Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to test content routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [
    '/api/content/all',
    '/api/content/home', 
    '/api/content/type/:type',
    '/api/content/:id',
    '/api/content/add',
    '/api/content/update/:id',
    '/api/content/:id',
    '/api/content/toggle-home/:id'
  ];
  res.json({ routes });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
