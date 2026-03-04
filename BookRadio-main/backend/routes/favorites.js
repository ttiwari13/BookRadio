const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const User = require("../models/User");

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:bookId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const bookId = req.params.bookId;
    if (user.favorites.includes(bookId)) {
      return res.status(400).json({ message: "Book already in favorites" });
    }

    user.favorites.push(bookId);
    await user.save();

    res.json({ message: "Added to favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:bookId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.bookId
    );
    await user.save();

    res.json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;