const axios = require("axios");
const mongoose = require("mongoose");
const xml2js = require("xml2js");
const cheerio = require("cheerio");
const connectDB = require("./config/db");
const Book = require("./models/Book");

// Configuration - 10K books in 100 batches
const BATCH_SIZE = 100;
const TOTAL_BOOKS = 10000;
const DELAY_BETWEEN_REQUESTS = 300; // Reduced for faster processing
const DELAY_BETWEEN_BATCHES = 1000; // 1 second between batches
const MAX_RETRIES = 3;

// Genre keywords mapping
const GENRE_KEYWORDS = {
  'Fiction': ['novel', 'story', 'tale', 'narrative', 'fiction'],
  'Mystery': ['mystery', 'detective', 'crime', 'murder', 'investigation', 'sherlock', 'holmes'],
  'Romance': ['romance', 'love', 'romantic', 'courtship', 'marriage', 'hearts'],
  'Adventure': ['adventure', 'journey', 'quest', 'expedition', 'travel', 'exploration'],
  'Horror': ['horror', 'ghost', 'haunted', 'terror', 'supernatural', 'vampire', 'monster'],
  'Science Fiction': ['science fiction', 'sci-fi', 'future', 'space', 'alien', 'technology', 'robot'],
  'Fantasy': ['fantasy', 'magic', 'wizard', 'dragon', 'fairy', 'enchanted', 'mythical'],
  'Historical': ['historical', 'history', 'war', 'civil war', 'revolution', 'ancient', 'medieval'],
  'Biography': ['biography', 'life of', 'memoirs', 'autobiography', 'life and times'],
  'Philosophy': ['philosophy', 'philosophical', 'ethics', 'moral', 'metaphysics', 'logic'],
  'Poetry': ['poetry', 'poems', 'verse', 'sonnet', 'ballad', 'rhyme'],
  'Drama': ['drama', 'play', 'tragedy', 'comedy', 'theatrical', 'act', 'scene'],
  'Children': ['children', 'kids', 'juvenile', 'young readers', 'fairy tale', 'nursery'],
  'Religion': ['religious', 'bible', 'christian', 'spiritual', 'prayer', 'sermon', 'theology'],
  'Non-Fiction': ['essays', 'treatise', 'study', 'analysis', 'examination', 'discourse']
};

connectDB();

// Function to detect genres from text
function detectGenresFromText(title, description) {
  const detectedGenres = new Set();
  const textToAnalyze = `${title} ${description}`.toLowerCase();
  
  Object.entries(GENRE_KEYWORDS).forEach(([genre, keywords]) => {
    const hasKeyword = keywords.some(keyword => 
      textToAnalyze.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      detectedGenres.add(genre);
    }
  });
  
  return Array.from(detectedGenres);
}

// Enhanced genre extraction with retry logic
async function getGenresFromPage(bookUrl, retryCount = 0) {
  try {
    const { data } = await axios.get(bookUrl, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AudiobookSeeder/1.0)'
      }
    });
    const $ = cheerio.load(data);

    let genres = [];

    // Method 1: Look for Genre(s): pattern
    $("p").each((i, el) => {
      const text = $(el).text();
      if (text.includes("Genre(s):")) {
        const genreText = text.split("Genre(s):")[1]?.trim();
        if (genreText) {
          genres = genreText.split(/[,;]/).map(g => g.trim()).filter(g => g);
        }
      }
    });

    // Method 2: Look in metadata
    if (genres.length === 0) {
      $("dt").each((i, el) => {
        if ($(el).text().toLowerCase().includes("genre")) {
          const nextDD = $(el).next("dd");
          if (nextDD.length) {
            const genreText = nextDD.text().trim();
            genres = genreText.split(/[,;]/).map(g => g.trim()).filter(g => g);
          }
        }
      });
    }

    // Clean up genres
    genres = genres.map(g => {
      return g.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    });

    return genres;

  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      console.warn(` Retry ${retryCount + 1}/${MAX_RETRIES} for: ${bookUrl}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return getGenresFromPage(bookUrl, retryCount + 1);
    }
    console.warn(` Genre scraping failed after ${MAX_RETRIES} retries: ${bookUrl}`);
    return [];
  }
}

function parseHHMMSS(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    const [hh, mm, ss] = parts;
    return (hh || 0) + (mm || 0) / 60 + (ss || 0) / 3600;
  }
  if (parts.length === 2) {
    const [mm, ss] = parts;
    return (mm || 0) / 60 + (ss || 0) / 3600;
  }
  return 0;
}

async function fetchEpisodesRSS(rssUrl, retryCount = 0) {
  try {
    const { data } = await axios.get(rssUrl, { timeout: 10000 });
    const result = await xml2js.parseStringPromise(data);
    const items = result.rss.channel[0].item;

    if (!items || items.length === 0) {
      return [];
    }

    const episodes = items
      .map((item, index) => ({
        title: item.title?.[0] || `Episode ${index + 1}`,
        audioUrl: item.enclosure?.[0]?.$.url || "",
        duration: parseFloat(parseHHMMSS(item["itunes:duration"]?.[0])) * 60,
        language: "English",
        episodeNumber: index + 1,
      }))
      .filter(ep => ep.audioUrl && !isNaN(ep.duration));

    return episodes;

  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return fetchEpisodesRSS(rssUrl, retryCount + 1);
    }
    console.warn(` RSS fetch failed after ${MAX_RETRIES} retries: ${rssUrl}`);
    return [];
  }
}

// Enhanced genre processing
function processGenres(book, scrapedGenres, detectedGenres) {
  let finalGenres = [];
  let primaryGenre = "Unknown";

  // Priority 1: Scraped genres from page
  if (scrapedGenres.length > 0) {
    finalGenres = [...scrapedGenres];
    primaryGenre = scrapedGenres[0];
  }
  // Priority 2: API genres
  else if (Array.isArray(book.genres) && book.genres.length > 0) {
    finalGenres = book.genres
      .map(g => (typeof g === "string" ? g : g?.name))
      .filter(Boolean);
    primaryGenre = finalGenres[0];
  }
  // Priority 3: Detected genres from text
  else if (detectedGenres.length > 0) {
    finalGenres = [...detectedGenres];
    primaryGenre = detectedGenres[0];
  }

  // Combine and deduplicate if we have both scraped and detected
  if (scrapedGenres.length > 0 && detectedGenres.length > 0) {
    const combined = [...new Set([...scrapedGenres, ...detectedGenres])];
    finalGenres = combined;
  }

  return {
    genres: finalGenres,
    primaryGenre: primaryGenre
  };
}

async function seedBooks() {
  const totalBatches = Math.ceil(TOTAL_BOOKS / BATCH_SIZE);
  console.log(` Starting to seed ${TOTAL_BOOKS.toLocaleString()} books`);
  console.log(` Processing in ${totalBatches} batches of ${BATCH_SIZE} books each`);
  console.log(`Estimated time: ${Math.round((totalBatches * 2) / 60)} hours\n`);
  
  let totalSavedBooks = 0;
  let booksWithGenres = 0;
  let totalSkipped = 0;
  const startTime = Date.now();

  for (let offset = 0; offset < TOTAL_BOOKS; offset += BATCH_SIZE) {
    const currentBatch = Math.floor(offset / BATCH_SIZE) + 1;
    const booksInThisBatch = Math.min(BATCH_SIZE, TOTAL_BOOKS - offset);
    
    console.log(`\n BATCH ${currentBatch}/${totalBatches}: Processing books ${offset + 1} to ${offset + booksInThisBatch}`);
    
    try {
      const res = await axios.get(
        `https://librivox.org/api/feed/audiobooks/?format=json&limit=${BATCH_SIZE}&offset=${offset}`,
        { timeout: 20000 }
      );

      if (!res.data.books || res.data.books.length === 0) {
        console.log(` No more books found at offset ${offset}`);
        break;
      }

      const booksWithEpisodes = [];
      let batchGenreCount = 0;

      for (const [index, b] of res.data.books.entries()) {
        const bookNumber = offset + index + 1;
        process.stdout.write(`\r Processing book ${bookNumber}/${TOTAL_BOOKS}: ${b.title?.substring(0, 50)}...`);
        
        const authorFirst = b.authors?.[0]?.first_name || "";
        const authorLast = b.authors?.[0]?.last_name || "";
        const fullAuthor = `${authorFirst} ${authorLast}`.trim();

        // Fetch episodes
        const rssUrl = b.url_rss;
        const episodes = rssUrl ? await fetchEpisodesRSS(rssUrl) : [];

        if (!episodes.length) {
          totalSkipped++;
          continue;
        }

        // Calculate total duration
        const totalMinutes = episodes.reduce((sum, ep) => sum + ep.duration, 0);

        // Parse year safely
        const parsedYear = parseInt(b.copyright_year);
        const validYear = parsedYear >= 1000 ? parsedYear : undefined;

        // Enhanced genre detection
        const detectedGenres = detectGenresFromText(
          b.title || '', 
          b.description || ''
        );

        // Scrape genres from LibriVox page (with rate limiting)
        let scrapedGenres = [];
        if (b.url_librivox && Math.random() < 0.7) { // Scrape 70% of books to balance speed vs accuracy
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
          scrapedGenres = await getGenresFromPage(b.url_librivox);
        }

        // Process and combine genres
        const genreResult = processGenres(b, scrapedGenres, detectedGenres);

        if (genreResult.genres.length > 0) {
          booksWithGenres++;
          batchGenreCount++;
        }

        // Create book object
        const bookData = {
          title: b.title || "Untitled",
          author: fullAuthor || "Unknown",
          description: b.description || "No description available.",
          language: b.language || "English",
          year: validYear,
          duration: Math.round(totalMinutes),
          genre: genreResult.primaryGenre,
          tags: genreResult.genres,
          image: b.url_librivox
            ? b.url_librivox.replace("https://librivox.org", "https://archive.org/services/img")
            : "",
          project_id: b.id,
          episodes,
          detectedGenres: detectedGenres,
          scrapedGenres: scrapedGenres,
          librivoxUrl: b.url_librivox,
          rssUrl: b.url_rss,
          totalSections: b.num_sections || episodes.length,
          lastUpdated: new Date()
        };

        booksWithEpisodes.push(bookData);
      }

      // Save batch to database
      if (booksWithEpisodes.length > 0) {
        await Book.insertMany(booksWithEpisodes, { ordered: false });
        totalSavedBooks += booksWithEpisodes.length;
        
        const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
        const booksPerMinute = totalSavedBooks / elapsed;
        const estimatedRemaining = (TOTAL_BOOKS - totalSavedBooks) / booksPerMinute;
        
        console.log(`\n BATCH ${currentBatch} COMPLETE:`);
        console.log(`    Saved: ${booksWithEpisodes.length} books`);
        console.log(`    With genres: ${batchGenreCount} (${((batchGenreCount/booksWithEpisodes.length)*100).toFixed(1)}%)`);
        console.log(`    Total progress: ${totalSavedBooks}/${TOTAL_BOOKS} (${((totalSavedBooks/TOTAL_BOOKS)*100).toFixed(1)}%)`);
        console.log(`    Overall genre rate: ${((booksWithGenres/totalSavedBooks)*100).toFixed(1)}%`);
        console.log(`    Estimated remaining: ${Math.round(estimatedRemaining)} minutes`);
      }

    } catch (err) {
      console.error(`\n Error in batch ${currentBatch}:`, err.message);
      
      // Add exponential backoff for network errors
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        const backoffTime = Math.min(5000 * Math.pow(2, currentBatch % 3), 30000);
        console.log(` Network issue, waiting ${backoffTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    // Delay between batches
    if (offset + BATCH_SIZE < TOTAL_BOOKS) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  // Final statistics
  const totalTime = (Date.now() - startTime) / 1000 / 60; // minutes
  console.log(`\n SEEDING COMPLETE!`);
  console.log(` FINAL STATISTICS:`);
  console.log(`    Total books saved: ${totalSavedBooks.toLocaleString()}`);
  console.log(`    Books with genres: ${booksWithGenres.toLocaleString()} (${((booksWithGenres/totalSavedBooks)*100).toFixed(1)}%)`);
  console.log(`    Books skipped (no audio): ${totalSkipped.toLocaleString()}`);
  console.log(`    Total time: ${Math.round(totalTime)} minutes`);
  console.log(`    Average speed: ${(totalSavedBooks/totalTime).toFixed(1)} books/minute`);

  // Show genre distribution
  try {
    const genreStats = await Book.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);
    
    console.log(`\n TOP GENRES IN DATABASE:`);
    genreStats.forEach((stat, index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${stat._id}: ${stat.count.toLocaleString()} books`);
    });
  } catch (err) {
    console.log(` Could not generate genre statistics: ${err.message}`);
  }

  mongoose.connection.close();
}

// Enhanced error handling
process.on('unhandledRejection', (err) => {
  console.error('\n Unhandled Promise Rejection:', err);
  mongoose.connection.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n Seeding interrupted by user');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n Seeding terminated');
  mongoose.connection.close();
  process.exit(0);
});

// Start seeding
console.log(' LibriVox Mass Seeder - 10,000 Books in 100 Batches');
console.log('=' .repeat(60));
seedBooks().catch(err => {
  console.error(' Seeding failed:', err);
  mongoose.connection.close();
  process.exit(1);
});
