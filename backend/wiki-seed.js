// wiki-seed.js
// Fetches movie data from Wikipedia instead of TMDB — much better coverage
// for Indian regional-language films.
//
// Setup:
//   npm install dotenv axios
//
// Input file: wiki_mapping.json — an array like:
//   [
//     { "title": "The Paradise", "poster_file": "the-paradise.png" },
//     { "title": "Kantara Chapter 1", "poster_file": "kantara-chapter-1.png" }
//   ]
// Put ONLY the titles that TMDB got wrong (the regional Indian ones) in here.
// Tip: search "<title> film wikipedia" yourself first if you're not sure
// the plain title will resolve to the right page.
//
// Run: node wiki-seed.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import Movie from "./models/movieModel.js";
import mapping from "./wiki-mapping.json" with { type: "json" };

dotenv.config();

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKI_REST = "https://en.wikipedia.org/api/rest_v1/page/summary";

// Wikipedia's API rejects requests without a descriptive User-Agent (403 Forbidden).
// This is required by their API etiquette policy.
const wikiHeaders = {
  "User-Agent": "CineBookSeedScript/1.0 (student project; contact: your-email@example.com)",
};

// --------------------------------------------------
// Wiki text cleaning helpers
// --------------------------------------------------

function stripWikitext(str = "") {
  if (!str) return "";
  return str
    .replace(/<ref[^]*?<\/ref>/gi, "")       // remove <ref>...</ref>
    .replace(/<ref[^/]*\/>/gi, "")           // remove self-closing refs
    .replace(/\{\{[^{}]*\}\}/g, "")          // remove simple {{templates}}
    .replace(/\[\[([^\]|]*\|)?([^\]]+)\]\]/g, "$2") // [[a|b]] -> b, [[a]] -> a
    .replace(/'''?/g, "")                    // bold/italic markers
    .replace(/<br\s*\/?>/gi, ", ")
    .replace(/\* /g, "")
    .replace(/\n+/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .trim();
}

function splitList(raw = "") {
  const cleaned = stripWikitext(raw);
  if (!cleaned) return [];
  return cleaned
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// --------------------------------------------------
// Find the right Wikipedia page
// --------------------------------------------------

async function searchWikiPage(title) {
  // bias search toward film pages
  const { data } = await axios.get(WIKI_API, {
    headers: wikiHeaders,
    params: {
      action: "query",
      list: "search",
      srsearch: `${title} film`,
      format: "json",
      srlimit: 5,
    },
  });
  const results = data.query?.search || [];
  if (!results.length) return null;

  // prefer a result whose title contains "(film)" or matches closely
  const filmMatch = results.find((r) => /\(.*film.*\)/i.test(r.title));
  return (filmMatch || results[0]).title;
}

// --------------------------------------------------
// Fetch raw wikitext for the infobox
// --------------------------------------------------

async function fetchWikitext(pageTitle) {
  const { data } = await axios.get(WIKI_API, {
    headers: wikiHeaders,
    params: {
      action: "query",
      prop: "revisions",
      rvslots: "main",
      rvprop: "content",
      titles: pageTitle,
      format: "json",
    },
  });
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0];
  return page?.revisions?.[0]?.slots?.main?.["*"] || "";
}

// --------------------------------------------------
// Extract the {{Infobox film ...}} block and parse fields
// --------------------------------------------------

function extractInfobox(wikitext) {
  const startIdx = wikitext.search(/\{\{\s*Infobox film/i);
  if (startIdx === -1) return {};

  // find matching closing braces by depth counting
  let depth = 0;
  let i = startIdx;
  let end = wikitext.length;
  for (; i < wikitext.length; i++) {
    if (wikitext[i] === "{" && wikitext[i + 1] === "{") { depth++; i++; }
    else if (wikitext[i] === "}" && wikitext[i + 1] === "}") {
      depth--; i++;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  const block = wikitext.slice(startIdx, end);

  const fields = {};
  const regex = /\|\s*([a-zA-Z_]+)\s*=\s*([\s\S]*?)(?=\n\s*\|\s*[a-zA-Z_]+\s*=|\n\}\}$)/g;
  let m;
  while ((m = regex.exec(block)) !== null) {
    fields[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return fields;
}

function parseRuntime(raw = "") {
  const cleaned = stripWikitext(raw);
  const match = cleaned.match(/(\d+)\s*min/);
  return match ? parseInt(match[1], 10) : 0;
}

function guessGenreFromCategories(wikitext) {
  const cats = [...wikitext.matchAll(/\[\[Category:([^\]]+)\]\]/g)].map((m) => m[1]);
  const knownGenres = [
    "Action", "Comedy", "Drama", "Thriller", "Horror", "Romance", "Fantasy",
    "Crime", "Mystery", "Adventure", "Animation", "Musical", "War", "Biographical",
    "Sports", "Family",
  ];
  const found = new Set();
  cats.forEach((c) => {
    knownGenres.forEach((g) => {
      if (c.toLowerCase().includes(g.toLowerCase())) found.add(g);
    });
  });
  return [...found];
}

// --------------------------------------------------
// Slots / type helpers (same as TMDB seed script)
// --------------------------------------------------

function generateSlots() {
  const slots = [];
  const times = [
    { time: "10:30", ampm: "AM" },
    { time: "02:00", ampm: "PM" },
    { time: "07:00", ampm: "PM" },
  ];
  for (let d = 0; d < 3; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    times.forEach((t) => slots.push({ date: dateStr, ...t }));
  }
  return slots;
}

function toPeople(names = [], role = "") {
  return names.map((name) => ({ name, role, file: null }));
}

// --------------------------------------------------
// Main
// --------------------------------------------------

async function seedFromWiki() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  console.log(`${mapping.length} titles to process\n`);

  let inserted = 0, skipped = 0, failed = 0;

  for (const entry of mapping) {
    console.log(`\n🎬 ${entry.title}`);

    try {
      const exists = await Movie.findOne({ movieName: new RegExp(`^${entry.title}$`, "i") });
      if (exists) {
        console.log("⏭️  already in DB, skipping");
        skipped++;
        continue;
      }

      const pageTitle = await searchWikiPage(entry.title);
      if (!pageTitle) {
        console.log("❌ no Wikipedia page found");
        failed++;
        continue;
      }
      console.log(`🔎 matched page: ${pageTitle}`);

      const [wikitext, summary] = await Promise.all([
        fetchWikitext(pageTitle),
        axios.get(`${WIKI_REST}/${encodeURIComponent(pageTitle)}`, { headers: wikiHeaders }).then((r) => r.data).catch(() => null),
      ]);

      const infobox = extractInfobox(wikitext);

      const directors = toPeople(splitList(infobox.director), "Director");
      const producers = toPeople(splitList(infobox.producer), "Producer");
      const cast = toPeople(splitList(infobox.starring).slice(0, 6), "");
      const genres = guessGenreFromCategories(wikitext);
      const runtime = parseRuntime(infobox.runtime);
      const story = summary?.extract || stripWikitext(infobox.plot) || "";
      const releasedRaw = stripWikitext(infobox.released || "");
      const releaseDateGuess = new Date(releasedRaw);
      const type = !isNaN(releaseDateGuess) && releaseDateGuess > new Date() ? "releaseSoon" : "normal";

      const movieDoc = {
        type,
        movieName: entry.title, // keep YOUR title, not wiki's disambiguated page name
        categories: genres,
        poster: entry.poster_file, // bare filename — your frontend already prepends /uploads/
        trailerUrl: "",
        videoUrl: "",
        rating: 0, // Wikipedia has no numeric rating; edit manually via admin if needed
        duration: runtime,
        slots: type === "releaseSoon" ? [] : generateSlots(),
        seatPrices: { standard: 150, recliner: 300 },
        auditorium: "Audi 1",
        cast,
        directors,
        producers,
        story,
      };

      await Movie.create(movieDoc);
      inserted++;
      console.log(`✅ seeded [${type}]: ${entry.title}`);

      await new Promise((r) => setTimeout(r, 300)); // be polite to Wikipedia's API
    } catch (err) {
      failed++;
      console.log("❌ failed:", err.message);
    }
  }

  console.log("\n================================");
  console.log(`📦 Inserted: ${inserted}  ⏭️ Skipped: ${skipped}  ❌ Failed: ${failed}`);
  console.log("================================");

  process.exit();
}

seedFromWiki().catch((err) => {
  console.error(err);
  process.exit(1);
});