const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
console.log("🔍 Auth routes file loaded"); 
const User = require('../models/User');

router.post('/register', (req, res, next) => {
  console.log("🔍 Register route hit"); // Add this line
  register(req, res, next);
});
router.post('/login', login);

// ✅ Enable /me route to return current logged-in user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error("❌ Auth me error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;