const User = require('../models/User');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true } // return updated version
    ).select('-password'); // remove password from response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: "✅ Profile updated successfully",
      user,
      uploadedImage: req.file ? `/uploads/${req.file.filename}` : null
    });
  } catch (err) {
    console.error("❌ Profile Update Error:", err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


module.exports = { updateProfile, getProfile };
