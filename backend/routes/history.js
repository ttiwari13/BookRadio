const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const User = require("../models/User");

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("history.book");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.history);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:bookId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const bookId = req.params.bookId;
    user.history = user.history.filter((h) => h.book.toString() !== bookId);
    user.history.unshift({ book: bookId, playedAt: new Date() });
    user.history = user.history.slice(0, 20);
    await user.save();
    res.json({ message: "History updated" });
  } catch (err) {
    console.error("Add history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.history = [];
    await user.save();
    res.json({ message: "History cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;