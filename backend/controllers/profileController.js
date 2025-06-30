const User = require('../models/User');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      email: user.email,
      avatar: user.avatar || null, // Only filename or null
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, currentPassword, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;

    // If password is changing
    if (password) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });
      user.password = password;
    }

    // Handle avatar update
    if (req.file) {
      user.avatar = req.file.filename; // Save only filename
    }

    const updatedUser = await user.save();

    res.json({
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar || null, // Only filename or null
    });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

module.exports = { updateProfile, getProfile };
