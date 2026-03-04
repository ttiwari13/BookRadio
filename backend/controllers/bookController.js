// controllers/bookController.js
const Book = require('../models/Book');

const searchBooks = async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Create search filters
    const regex = new RegExp(query, 'i');
    const searchFilters = {
      $or: [
        { title: { $regex: regex } },
        { author: { $regex: regex } },
        { description: { $regex: regex } },
        { genre: { $regex: regex } },
        { tags: { $in: [regex] } }
      ]
    };

    // Add additional filters if provided
    if (req.query.language) searchFilters.language = req.query.language;
    if (req.query.genre) searchFilters.genre = req.query.genre;
    if (req.query.duration) searchFilters.durationCategory = req.query.duration;
    if (req.query.author) searchFilters.author = req.query.author;

    const totalBooks = await Book.countDocuments(searchFilters);
    const books = await Book.find(searchFilters)
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
      searchQuery: query,
      appliedFilters: searchFilters
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: "Search failed", 
      error: error.message 
    });
  }
};

module.exports = {
  searchBooks,
  // Add other controller functions here...
};