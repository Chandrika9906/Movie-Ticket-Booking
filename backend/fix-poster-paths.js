// fix-poster-paths.js
// One-time fix for movies seeded with poster: "/uploads/xxx.png"
// when the frontend already prepends "/uploads" itself, causing
// requests to hit /uploads/uploads/xxx.png (404).
//
// This strips any leading "/uploads/" (however many times it got
// duplicated) so poster ends up as just "xxx.png", matching how
// your original 6 hand-uploaded movies are stored.
//
// Run: node fix-poster-paths.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "./models/movieModel.js";

dotenv.config();

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const movies = await Movie.find({ poster: { $regex: "^/?uploads/" } });
  console.log(`Found ${movies.length} movies with an /uploads/ prefix to strip`);

  let fixed = 0;
  for (const movie of movies) {
    const before = movie.poster;
    const after = before.replace(/^\/?(uploads\/)+/, ""); // strip ALL leading uploads/ segments
    if (before !== after) {
      movie.poster = after;
      await movie.save();
      console.log(`✅ ${before}  ->  ${after}`);
      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} of ${movies.length}.`);
  process.exit();
}

fix().catch((err) => {
  console.error(err);
  process.exit(1);
});