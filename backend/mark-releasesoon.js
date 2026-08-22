// mark-releasesoon.js
// Your Coming Soon / Releases pages are empty because no seeded movie
// has type: "releaseSoon" (seed scripts defaulted everyone to normal/featured,
// and most seeded titles' real release dates have already passed anyway).
// This flags a chosen list of movies as releaseSoon so those pages have content.
//
// Edit the TITLES array to whichever movies you want showing as "upcoming".
// Run: node mark-releasesoon.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "./models/movieModel.js";

dotenv.config({ override: true });

// Pick any movies you want to appear as "Coming Soon" — doesn't have to be
// scientifically accurate, just needs to feel right for your demo/portfolio.
const TITLES = [
  "Spider-Man: Brand New Day",
  "Kantara: Chapter 1",
  "Toxic",
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  for (const title of TITLES) {
    const movie = await Movie.findOne({ movieName: new RegExp(`^${title}$`, "i") });
    if (!movie) {
      console.log(`⏭️  "${title}" not found`);
      continue;
    }
    movie.type = "releaseSoon";
    await movie.save();
    console.log(`✅ ${title} → releaseSoon`);
  }

  process.exit();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});