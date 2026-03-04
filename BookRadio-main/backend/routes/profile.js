// routes/profile.js (CLEANED UP)
const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const upload = require('../middleware/upload');
const { updateProfile, getProfile } = require('../controllers/profileController');
router.get('/', protect, getProfile);
router.put('/', protect, upload.single('image'), updateProfile);

module.exports = router;