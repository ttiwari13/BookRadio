// models/Book.js - Enhanced Book model with proper genre support
const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  language: {
    type: String,
    default: 'English'
  },
  episodeNumber: {
    type: Number,
    required: true
  }
}, { _id: false });

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true // For search performance
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true // For search performance
  },
  description: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'English',
    index: true
  },
  year: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear(),
    index: true
  },
  duration: {
    type: Number, // Total duration in minutes
    required: true,
    min: 0
  },
  
  // ✅ Enhanced Genre Support
  genre: {
    type: String,
    required: true,
    default: 'Unknown',
    index: true // Primary genre for quick filtering
  },
  tags: [{
    type: String,
    trim: true,
    index: true // All genres/tags for detailed filtering
  }],
  
  // ✅ Genre Metadata (for debugging and analysis)
  detectedGenres: [{
    type: String,
    trim: true
  }],
  scrapedGenres: [{
    type: String,
    trim: true
  }],
  
  // Media and Links
  image: {
    type: String,
    default: ''
  },
  librivoxUrl: {
    type: String,
    default: ''
  },
  rssUrl: {
    type: String,
    default: ''
  },
  
  // LibriVox Specific
  project_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalSections: {
    type: Number,
    default: 0
  },
  
  // Audio Episodes
  episodes: [episodeSchema],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Computed fields for search and filtering
  searchText: {
    type: String,
    index: 'text' // Full-text search index
  },
  
  // Analytics fields
  popularity: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Indexes for performance
bookSchema.index({ genre: 1, language: 1 });
bookSchema.index({ tags: 1, year: 1 });
bookSchema.index({ author: 1, title: 1 });
bookSchema.index({ duration: 1, genre: 1 });
bookSchema.index({ createdAt: -1 });

// ✅ Pre-save middleware to update search text and computed fields
bookSchema.pre('save', function(next) {
  // Update search text for full-text search
  this.searchText = `${this.title} ${this.author} ${this.description} ${this.tags.join(' ')}`;
  
  // Update lastUpdated
  this.lastUpdated = new Date();
  
  // Ensure we have at least one genre
  if (!this.tags || this.tags.length === 0) {
    this.tags = [this.genre || 'Unknown'];
  }
  
  // Ensure primary genre is in tags
  if (this.genre && !this.tags.includes(this.genre)) {
    this.tags.unshift(this.genre);
  }
  
  next();
});

// ✅ Virtual fields
bookSchema.virtual('totalEpisodes').get(function() {
  return this.episodes ? this.episodes.length : 0;
});

bookSchema.virtual('durationHours').get(function() {
  return Math.round((this.duration / 60) * 10) / 10; // Round to 1 decimal
});

bookSchema.virtual('hasAudio').get(function() {
  return this.episodes && this.episodes.length > 0;
});

bookSchema.virtual('genreList').get(function() {
  return this.tags && this.tags.length > 0 ? this.tags : [this.genre];
});

// ✅ Static methods for common queries
bookSchema.statics.findByGenre = function(genre, options = {}) {
  const { limit = 20, skip = 0, sortBy = 'title' } = options;
  
  return this.find({
    $or: [
      { genre: new RegExp(genre, 'i') },
      { tags: new RegExp(genre, 'i') }
    ]
  })
  .limit(limit)
  .skip(skip)
  .sort(sortBy);
};

bookSchema.statics.searchBooks = function(query, options = {}) {
  const { limit = 20, skip = 0, genre, author, year } = options;
  
  let searchQuery = {};
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Filter by genre
  if (genre) {
    searchQuery.$or = [
      { genre: new RegExp(genre, 'i') },
      { tags: new RegExp(genre, 'i') }
    ];
  }
  
  // Filter by author
  if (author) {
    searchQuery.author = new RegExp(author, 'i');
  }
  
  // Filter by year
  if (year) {
    if (typeof year === 'object') {
      searchQuery.year = year; // { $gte: 1900, $lte: 2000 }
    } else {
      searchQuery.year = year;
    }
  }
  
  return this.find(searchQuery)
    .limit(limit)
    .skip(skip)
    .sort({ score: { $meta: "textScore" }, title: 1 });
};

bookSchema.statics.getGenreStats = function() {
  return this.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

bookSchema.statics.getPopularBooks = function(limit = 10) {
  return this.find({ episodes: { $exists: true, $not: { $size: 0 } } })
    .sort({ popularity: -1, rating: -1, title: 1 })
    .limit(limit);
};

// ✅ Instance methods
bookSchema.methods.addGenre = function(genre) {
  if (!this.tags.includes(genre)) {
    this.tags.push(genre);
  }
  return this.save();
};

bookSchema.methods.removeGenre = function(genre) {
  this.tags = this.tags.filter(tag => tag !== genre);
  return this.save();
};

bookSchema.methods.updateGenres = function(genres) {
  this.tags = [...new Set(genres)]; // Remove duplicates
  if (this.tags.length > 0) {
    this.genre = this.tags[0]; // Set primary genre
  }
  return this.save();
};

// ✅ Export the model
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;