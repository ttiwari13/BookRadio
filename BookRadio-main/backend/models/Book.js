
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
    type: Number, 
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
    index: true 
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true 
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
    type: Number, 
    required: true,
    min: 0
  },
  
  genre: {
    type: String,
    required: true,
    default: 'Unknown',
    index: true 
  },
  tags: [{
    type: String,
    trim: true,
    index: true 
  }],
  detectedGenres: [{
    type: String,
    trim: true
  }],
  scrapedGenres: [{
    type: String,
    trim: true
  }],
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
  episodes: [episodeSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },

  searchText: {
    type: String,
    index: 'text'
  },
  
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
bookSchema.index({ genre: 1, language: 1 });
bookSchema.index({ tags: 1, year: 1 });
bookSchema.index({ author: 1, title: 1 });
bookSchema.index({ duration: 1, genre: 1 });
bookSchema.index({ createdAt: -1 });
bookSchema.pre('save', function(next) {
  this.searchText = `${this.title} ${this.author} ${this.description} ${this.tags.join(' ')}`;
  this.lastUpdated = new Date();

  if (!this.tags || this.tags.length === 0) {
    this.tags = [this.genre || 'Unknown'];
  }
 
  if (this.genre && !this.tags.includes(this.genre)) {
    this.tags.unshift(this.genre);
  }
  
  next();
});


bookSchema.virtual('totalEpisodes').get(function() {
  return this.episodes ? this.episodes.length : 0;
});

bookSchema.virtual('durationHours').get(function() {
  return Math.round((this.duration / 60) * 10) / 10; 
});

bookSchema.virtual('hasAudio').get(function() {
  return this.episodes && this.episodes.length > 0;
});

bookSchema.virtual('genreList').get(function() {
  return this.tags && this.tags.length > 0 ? this.tags : [this.genre];
});

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
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (genre) {
    searchQuery.$or = [
      { genre: new RegExp(genre, 'i') },
      { tags: new RegExp(genre, 'i') }
    ];
  }
  
  if (author) {
    searchQuery.author = new RegExp(author, 'i');
  }
  

  if (year) {
    if (typeof year === 'object') {
      searchQuery.year = year; 
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
  this.tags = [...new Set(genres)]; 
  if (this.tags.length > 0) {
    this.genre = this.tags[0];
  }
  return this.save();
};
bookSchema.statics.getFilterOptions = async function () {
  const languages = await this.distinct("language", { language: { $ne: null } });
  const genres = await this.distinct("genre", { genre: { $ne: null } });
  const authors = await this.distinct("author", { author: { $ne: null } });
  const durations = await this.distinct("durationCategory", { durationCategory: { $ne: null } });

  return { languages, genres, authors, durations };
};
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
