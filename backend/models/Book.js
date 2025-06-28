const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  duration: { type: Number, required: true }, // Duration in minutes for easier filtering
  language: { type: String, required: true },
  audioUrl: { type: String, required: true },
  episodeNumber: { type: Number },
}, {
  timestamps: true
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  language: { type: String, required: true },
  year: { type: Number, min: 1000, max: new Date().getFullYear() },
  
  // IMPROVED FOR FILTERING
  genre: { type: String, required: true }, // Specific genre field for dropdown
  duration: { type: Number, required: true }, // Total duration in minutes for range filtering
  durationCategory: { 
    type: String, 
    enum: ['short', 'medium', 'long'], // Pre-categorized for easier dropdown filtering
  },
  
  image: { type: String },
  tags: [{ type: String, trim: true }], // Keep for additional tagging
  project_id: { type: Number, required: true, index: true },
  episodes: [episodeSchema],
}, {
  timestamps: true
});

// INDEXES FOR EFFICIENT FILTERING
bookSchema.index({ language: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ duration: 1 });
bookSchema.index({ durationCategory: 1 });
bookSchema.index({ project_id: 1 });

// VIRTUAL FOR DYNAMIC DURATION CATEGORY (if you prefer this approach)
bookSchema.virtual('computedDurationCategory').get(function() {
  if (this.duration <= 120) return 'short';     // 0-2 hours
  if (this.duration <= 480) return 'medium';    // 2-8 hours  
  return 'long';                                 // 8+ hours
});

// STATIC METHODS FOR DROPDOWN DATA
bookSchema.statics.getFilterOptions = async function() {
  const [languages, genres, authors] = await Promise.all([
    this.distinct('language'),
    this.distinct('genre'),
    this.distinct('author')
  ]);
  
  return {
    languages: languages.sort(),
    genres: genres.sort(),
    authors: authors.sort(),
    durations: [
      { label: 'Short (0-2 hours)', value: 'short' },
      { label: 'Medium (2-8 hours)', value: 'medium' },
      { label: 'Long (8+ hours)', value: 'long' }
    ]
  };
};

// STATIC METHOD FOR FILTERED SEARCH
bookSchema.statics.findFiltered = function(filters) {
  const query = {};
  
  if (filters.language) query.language = filters.language;
  if (filters.genre) query.genre = filters.genre;
  if (filters.author) query.author = filters.author;
  if (filters.duration) {
    // Handle duration category filtering
    switch(filters.duration) {
      case 'short':
        query.duration = { $lte: 120 };
        break;
      case 'medium':
        query.duration = { $gt: 120, $lte: 480 };
        break;
      case 'long':
        query.duration = { $gt: 480 };
        break;
    }
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Book', bookSchema);