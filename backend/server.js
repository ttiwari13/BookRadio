// server.js - FIXED FOR EXPRESS v5
const express = require("express");
const dotenv = require("dotenv");
const path = require("path"); // Add this import
dotenv.config();

const connectDB = require("./config/db");
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
const feedbackRoutes = require('./routes/feedback');

connectDB();

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    'https://bookfrontend-mauve.vercel.app',
    'http://localhost:4000',  // ✅ Added this line
   
    'http://127.0.0.1:4000'   // ✅ Added this line too
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// FIX: Use absolute path for static files in Express v5
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache');
  }
}));
// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profile');
// Home route for testing
app.get("/", (req, res) => {
  res.send("Book Radio is running...");
});

// Auth routes
app.use('/api/auth', authRoutes);

// Profile routes
app.use('/api/profile', profileRoutes);
// BookRoutes
app.use('/api/books', bookRoutes);
app.use('/api/feedback', feedbackRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// Start the server
// Start the server - RENDER COMPATIBLE
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
  
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 URL: https://bookradio-1.onrender.com`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});