const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
const cors = require('cors');

connectDB();

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    'https://book-radio.vercel.app',
    'http://localhost:5173',
    'http://localhost:4000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profile');
const bookRoutes = require('./routes/bookRoutes');
const feedbackRoutes = require('./routes/feedback');
const favoritesRoutes = require('./routes/favorites');
const historyRoutes = require('./routes/history'); // ← new

app.get("/", (req, res) => {
  res.send("Book Radio is running...");
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/history', historyRoutes); 

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    process.exit(1);
  }
});