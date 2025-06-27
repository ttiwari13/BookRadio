// routes/profile.js (CLEANED UP)
const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const upload = require('../middleware/upload');
const { updateProfile, getProfile } = require('../controllers/profileController');

// GET /api/profile - Get user profile
router.get('/', protect, getProfile);

// PUT /api/profile - Update user profile with optional image upload
router.put('/', protect, upload.single('image'), updateProfile);

module.exports = router;