// fix-kill-producer.js
// Wikipedia search matched a wrong/malformed page for "Kill", grabbing
// leftover template markup instead of real producer names. This patches
// just that one movie with the correct data (confirmed via Wikipedia's
// "Kill (film)" page).
//
// Run: node fix-kill-producer.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "./models/movieModel.js";

dotenv.config({ override: true });

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const movie = await Movie.findOne({ movieName: /^Kill$/i });
  if (!movie) {
    console.log("Kill not found in DB");
    process.exit();
  }

  movie.producers = [
    { name: "Karan Johar", role: "Producer", file: null },
    { name: "Guneet Monga", role: "Producer", file: null },
    { name: "Apoorva Mehta", role: "Producer", file: null },
    { name: "Achin Jain", role: "Producer", file: null },
  ];

  await movie.save();
  console.log("✅ Kill producers fixed:", movie.producers.map((p) => p.name).join(", "));
  process.exit();
}

fix().catch((err) => {
  console.error(err);
  process.exit(1);
});