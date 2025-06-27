// server.js - FIXED FOR EXPRESS v5
const express = require("express");
const dotenv = require("dotenv");
const path = require("path"); // Add this import
dotenv.config();

const connectDB = require("./config/db");
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server started on http://localhost:${PORT}`)
);