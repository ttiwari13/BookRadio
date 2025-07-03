const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect } = require('../middleware/authMiddleware');
const { searchBooks } = require('../controllers/bookController.js');

//  GET /api/books/filters - Get all filter options
router.get('/filters', async (req, res) => {
  try {
    const filterOptions = await Book.getFilterOptions();
    res.json(filterOptions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch filter options", error: err.message });
  }
});

//  GET /api/books/search?q=query (controller-based)
router.get('/search', searchBooks);

//  GET /api/books/tag/:tag
router.get('/tag/:tag', async (req, res) => {
  try {
    const books = await Book.find({ tags: req.params.tag }).limit(20);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Tag filter failed", error: err.message });
  }
});

//  GET /api/books/author/:name
router.get('/author/:name', async (req, res) => {
  try {
    const regex = new RegExp(req.params.name, 'i');
    const books = await Book.find({ author: regex }).limit(20);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Author search failed", error: err.message });
  }
});

//  GET /api/books?page=1&limit=20&language=English&genre=Fiction&duration=short&author=Tolkien
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.language) filters.language = req.query.language;
    if (req.query.genre) filters.genre = req.query.genre;
    if (req.query.duration) filters.durationCategory = req.query.duration;
    if (req.query.author) filters.author = req.query.author;

    const q = req.query.q;
    if (q) {
      const regex = new RegExp(q, 'i');
      filters.$or = [
        { title: { $regex: regex } },
        { author: { $regex: regex } }
      ];
    }

    const totalBooks = await Book.countDocuments(filters);
    const books = await Book.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      books,
      totalBooks,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      hasNextPage: page < Math.ceil(totalBooks / limit),
      hasPrevPage: page > 1,
      appliedFilters: filters,
      searchQuery: q || null
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

//  GET /api/books/:id/episodes
router.get('/:id/episodes', protect, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const episodes = book.episodes || book.parts || book.chapters || [];

    const formattedEpisodes = episodes.map((episode, index) => {
      if (typeof episode === 'object' && episode !== null) {
        return {
          _id: episode._id || episode.id || `ep_${book._id}_${index}`,
          title: episode.title || episode.name || `Episode ${index + 1}`,
          episodeNumber: episode.episodeNumber || index + 1,
          duration: episode.duration || 0,
          description: episode.description || '',
          audioUrl: episode.audioUrl || '',
          isCompleted: episode.isCompleted || false,
          bookId: book._id,
          ...episode
        };
      } else {
        return {
          _id: `ep_${book._id}_${index}`,
          title: `Episode ${index + 1}`,
          episodeNumber: index + 1,
          duration: 0,
          description: episode ? episode.toString() : '',
          audioUrl: '',
          isCompleted: false,
          bookId: book._id
        };
      }
    });

    res.json(formattedEpisodes);
  } catch (err) {
    console.error(' Error fetching episodes:', err);
    res.status(500).json({ 
      message: "Failed to fetch episodes", 
      error: err.message,
      bookId: req.params.id 
    });
  }
});

//  GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
