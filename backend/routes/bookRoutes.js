const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET /api/books - get all books (limit for pagination)
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().limit(20); // Change limit as needed
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});
// GET /api/books/:id - Get full book + episodes
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});
// GET /api/books/search?q=pride
router.get('/search/:query', async (req, res) => {
  try {
    const regex = new RegExp(req.params.query, 'i'); // case-insensitive
    const books = await Book.find({ title: regex }).limit(20);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});
// GET /api/books/tag/Fiction
router.get('/tag/:tag', async (req, res) => {
  try {
    const books = await Book.find({ tags: req.params.tag }).limit(20);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Tag filter failed", error: err.message });
  }
});
// GET /api/books/author/:name - search by author
router.get('/author/:name', async (req, res) => {
  try {
    const regex = new RegExp(req.params.name, 'i'); // case-insensitive regex
    const books = await Book.find({ author: regex }).limit(20);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Author search failed", error: err.message });
  }
});

module.exports = router;
