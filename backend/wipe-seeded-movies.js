// wipe-seeded-movies.js
// Deletes every movie whose poster field looks like it came from our
// seed scripts (matches your final_posters filenames), leaving your
// original 6 hand-uploaded movies untouched.
//
// Run: node wipe-seeded-movies.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "./models/movieModel.js";

dotenv.config();

// filenames from final_posters/ (the batch we generated) — anything
// matching one of these posters gets deleted so we can re-seed clean.
const SEEDED_POSTER_FILES = [
  "fighter.png", "peddi.png", "peddi-2.png", "baaghi-4.png",
  "kantara-chapter-1.png", "param-sundari.png", "maalik.png",
  "tere-ishk-mein.png", "toxic.png", "the-raja-saab.png",
  "the-paradise.png", "border-2.png", "avatar-fire-and-ash.png",
  "zootopia-2.png", "spider-man-brand-new-day.png", "rampage.png",
  "unknown.png", "avengers-infinity-war.png", "black-adam.png",
  "tehran.png", "kingdom.png", "war-2.png", "the-last-witch-hunter.png",
  "until-dawn.png", "bhootni.png", "partner.png", "phir-hera-pheri.png",
  "jolly-llb-3.png", "jolly-llb-3-2.png", "kill.png", "joker-folie-a-deux.png",
];

async function wipe() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // match on poster field containing any of these filenames,
  // regardless of whether it has a bad /uploads/ prefix or not
  const orConditions = SEEDED_POSTER_FILES.map((f) => ({
    poster: { $regex: f.replace(".", "\\."), $options: "i" },
  }));

  const toDelete = await Movie.find({ $or: orConditions });
  console.log(`Found ${toDelete.length} seeded movies to remove:`);
  toDelete.forEach((m) => console.log(`  - ${m.movieName}`));

  const res = await Movie.deleteMany({ $or: orConditions });
  console.log(`\n🗑️  Deleted ${res.deletedCount} movies.`);

  const remaining = await Movie.countDocuments();
  console.log(`📦 ${remaining} movies remain in DB (your original hand-seeded ones).`);

  process.exit();
}

wipe().catch((err) => {
  console.error(err);
  process.exit(1);
});