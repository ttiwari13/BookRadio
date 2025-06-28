const axios = require("axios");
const mongoose = require("mongoose");
const xml2js = require("xml2js");
const connectDB = require("./config/db");
const Book = require("./models/Book");

const BATCH_SIZE = 100;
const TOTAL_BOOKS = 20000; // 🔁 Seed 20,000 books with audio episodes only

connectDB();

async function fetchEpisodesRSS(rssUrl) {
  try {
    const { data } = await axios.get(rssUrl);
    const result = await xml2js.parseStringPromise(data);
    const items = result.rss.channel[0].item;

    if (!items || items.length === 0) return [];

    return items.map(item => ({
      title: item.title?.[0] || "Untitled",
      audioUrl: item.enclosure?.[0]?.$.url || "",
      duration: item["itunes:duration"]?.[0] || "Unknown",
    })).filter(ep => ep.audioUrl); // ⛔ Filter out episodes without audio URL
  } catch (err) {
    console.warn("❌ RSS fetch failed for:", rssUrl);
    return [];
  }
}

async function seedBooks() {
  for (let offset = 0; offset < TOTAL_BOOKS; offset += BATCH_SIZE) {
    console.log(`\n📦 Fetching books ${offset + 1} to ${offset + BATCH_SIZE}`);
    try {
      const res = await axios.get(
        `https://librivox.org/api/feed/audiobooks/?format=json&limit=${BATCH_SIZE}&offset=${offset}`
      );

      const booksWithEpisodes = [];

      for (const b of res.data.books) {
        const authorFirst = b.authors?.[0]?.first_name || "";
        const authorLast = b.authors?.[0]?.last_name || "";
        const fullAuthor = `${authorFirst} ${authorLast}`.trim();

        const rssUrl = b.url_rss;
        const episodes = rssUrl ? await fetchEpisodesRSS(rssUrl) : [];

        if (!episodes.length) {
          console.log(`⏩ Skipping: ${b.title}`);
          continue;
        }

        booksWithEpisodes.push({
          title: b.title || "Untitled",
          author: fullAuthor,
          description: b.description || "No description available.",
          language: b.language || "Unknown",
          year: b.copyright_year || "Unknown",
          duration: b.totaltime || "Unknown",
          image: b.url_librivox
            ? b.url_librivox.replace("https://librivox.org", "https://archive.org/services/img")
            : "",
          tags: b.genres || [],
          project_id: b.id,
          episodes,
        });
      }

      if (booksWithEpisodes.length) {
        await Book.insertMany(booksWithEpisodes);
        console.log(`✅ Saved ${booksWithEpisodes.length} books with episodes`);
      } else {
        console.log("🚫 No books saved in this batch");
      }
    } catch (err) {
      console.error("❌ Error during fetch/save:", err.message);
      break;
    }
  }

  mongoose.connection.close();
  console.log("\n🎉 Seeding complete!");
}

seedBooks();