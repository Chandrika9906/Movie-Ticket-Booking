// backfill-photos.js
// Your reference video shows real director/cast photos (not "?" placeholders)
// because that data came with actual uploaded images. Our seeded movies have
// file: null for every person since neither TMDB movie-credits nor Wikipedia
// infobox parsing gave us photos directly.
//
// FIX: TMDB has a separate "person" database with headshots for most actors/
// directors/producers worldwide (including plenty of Indian film industry
// people). This script looks up each name already in your DB and fills in
// a real photo URL where TMDB has one. Leaves "?" only for people TMDB
// genuinely doesn't have (rare, small crew).
//
// Run: node backfill-photos.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import Movie from "./models/movieModel.js";

dotenv.config();

const TMDB_KEY = process.env.TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

async function findPersonPhoto(name) {
  if (!name) return null;
  try {
    const { data } = await axios.get("https://api.themoviedb.org/3/search/person", {
      params: { api_key: TMDB_KEY, query: name },
    });
    const person = data.results?.[0];
    if (person?.profile_path) {
      return `${IMG_BASE}${person.profile_path}`;
    }
    return null;
  } catch {
    return null;
  }
}

async function fillPhotos(list = []) {
  for (const person of list) {
    if (!person.file) {
      const photo = await findPersonPhoto(person.name);
      if (photo) person.file = photo;
      await new Promise((r) => setTimeout(r, 150)); // be polite to TMDB's rate limit
    }
  }
  return list;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB\n");

  const movies = await Movie.find({});
  console.log(`${movies.length} movies to check\n`);

  let touched = 0;

  for (const movie of movies) {
    let changed = false;

    if (movie.cast?.some((p) => !p.file)) {
      movie.cast = await fillPhotos(movie.cast);
      changed = true;
    }
    if (movie.directors?.some((p) => !p.file)) {
      movie.directors = await fillPhotos(movie.directors);
      changed = true;
    }
    if (movie.producers?.some((p) => !p.file)) {
      movie.producers = await fillPhotos(movie.producers);
      changed = true;
    }

    if (changed) {
      await movie.save();
      touched++;
      console.log(`✅ ${movie.movieName} — photos updated`);
    }
  }

  console.log(`\nDone. ${touched} movies had photos filled in.`);
  process.exit();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});