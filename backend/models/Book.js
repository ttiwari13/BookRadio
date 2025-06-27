const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  title: String,
  duration: String,
  language: String,
  audioUrl: String,
});

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  language: String,
  year: String,
  duration: String,
  image: String,
  tags: [String],
  project_id: Number, // Required to fetch episodes
  episodes: [episodeSchema],
});

module.exports = mongoose.model('Book', bookSchema);
