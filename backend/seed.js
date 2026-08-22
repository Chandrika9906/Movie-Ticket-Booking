// seed.js
// Usage: node seed.js
// Requires: npm install dotenv axios
// .env needs: TMDB_API_KEY=xxxx  and  MONGO_URI=xxxx

import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Movie from "./models/movieModel.js";
import mapping from "./final_mapping_corrected.json" with { type: "json" };

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Folder where you've placed the renamed poster files (final_posters/*.png)
// Put this folder inside your project's public/uploads (or wherever `poster` paths resolve from)
const ASSET_DIR = path.join(__dirname, "final_posters");
const TMDB_KEY = process.env.TMDB_API_KEY;

async function searchTMDB(title) {
  const { data } = await axios.get("https://api.themoviedb.org/3/search/movie", {
    params: { api_key: TMDB_KEY, query: title },
  });
  return data.results?.[0] || null;
}

async function getDetails(id) {
  const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
    params: { api_key: TMDB_KEY },
  });
  return data;
}

async function getCredits(id) {
  const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${id}/credits`, {
    params: { api_key: TMDB_KEY },
  });
  return data;
}

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

function decideType(releaseDate) {
  if (!releaseDate) return "normal";
  return new Date(releaseDate) > new Date() ? "releaseSoon" : "normal";
}

function mapPeople(list = [], roleLabel = "") {
  return list.map((p) => ({
    name: p.name,
    role: roleLabel || p.job || p.character || "",
    file: null, // no local headshots for these — placeholders only, left null on purpose
  }));
}

async function seedAll() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  let featuredCount = 0;
  let i = 0;

  for (const entry of mapping) {
    i++;
    if (entry.title === "UNKNOWN") {
      console.log(`⏭  skipping ${entry.poster_file} — title not identified yet, fix final_mapping.json`);
      continue;
    }

    const exists = await Movie.findOne({ movieName: new RegExp(`^${entry.title}$`, "i") });
    if (exists) {
      console.log("⏭  already seeded:", entry.title);
      continue;
    }

    const found = await searchTMDB(entry.title);
    if (!found) {
      console.log("❌ no TMDB match:", entry.title);
      continue;
    }

    const details = await getDetails(found.id);
    const credits = await getCredits(found.id);

    const directors = mapPeople(credits.crew.filter((c) => c.job === "Director"), "Director");
    const producers = mapPeople(credits.crew.filter((c) => c.job === "Producer").slice(0, 3), "Producer");
    const cast = mapPeople(credits.cast.slice(0, 6));

    let type = decideType(details.release_date);
    if (type === "normal" && featuredCount < 8 && i % 8 === 0) {
      type = "featured";
      featuredCount++;
    }

    const movieDoc = {
      type,
      movieName: details.title,
      categories: details.genres.map((g) => g.name),
      poster: entry.poster_file, // bare filename — your frontend already prepends /uploads/
      trailerUrl: "",
      videoUrl: "",
      rating: details.vote_average || 0,
      duration: details.runtime || 0,
      slots: type === "releaseSoon" ? [] : generateSlots(),
      seatPrices: { standard: 150, recliner: 300 },
      auditorium: "Audi 1",
      cast,
      directors,
      producers,
      story: details.overview,
    };

    await Movie.create(movieDoc);
    console.log(`✅ seeded [${type}]:`, details.title);
  }

  console.log("Done seeding.");
  process.exit();
}

seedAll().catch((err) => {
  console.error(err);
  process.exit(1);
});