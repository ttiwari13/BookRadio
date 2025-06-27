const axios = require("axios");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Book = require("./models/Book");

const BATCH_SIZE = 100;
const TOTAL_BOOKS = 500; // 🔁 Start with 500 to test; later do 20,000+

connectDB();

async function fetchEpisodes(project_id) {
  try {
    const res = await axios.get(`https://librivox.org/api/feed/audiotracks/?format=json&project_id=${project_id}`);
    return res.data.audiotracks.map(track => ({
      title: track.title,
      duration: track.playtime,
      language: track.language,
      audioUrl: track.url,
    }));
  } catch (err) {
    console.warn(`⚠️ Episodes fetch failed for project ${project_id}`);
    return [];
  }
}

async function seedBooks() {
  for (let offset = 0; offset < TOTAL_BOOKS; offset += BATCH_SIZE) {
    console.log(`📦 Fetching books ${offset + 1} to ${offset + BATCH_SIZE}`);
    try {
      const res = await axios.get(
        `https://librivox.org/api/feed/audiobooks/?format=json&limit=${BATCH_SIZE}&offset=${offset}`
      );

      const books = await Promise.all(
        res.data.books.map(async (b) => {
          const episodes = await fetchEpisodes(b.id);

          return {
            title: b.title,
            author: b.authors?.[0]?.first_name + " " + b.authors?.[0]?.last_name,
            description: b.description,
            language: b.language,
            year: b.copyright_year || "",
            duration: b.totaltime || "",
            image: b.url_librivox?.replace("https://librivox.org", "https://archive.org/services/img") || "",
            tags: b.genres || [],
            project_id: b.id,
            episodes,
          };
        })
      );

      await Book.insertMany(books);
      console.log(`✅ Saved ${books.length} books`);
    } catch (err) {
      console.error("❌ Error fetching/saving:", err.message);
      break;
    }
  }

  mongoose.connection.close();
  console.log("🎉 Done seeding all books!");
}

seedBooks();
