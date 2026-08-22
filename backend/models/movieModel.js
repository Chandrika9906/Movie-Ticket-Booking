// models/movieModel.js
import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" }, // used for cast
    file: { type: String, trim: true, default: null }, // saved filename or URL
  },
  { _id: false }
);

const slotSchema = new mongoose.Schema(
  {
    date: { type: String, default: "" }, // keep as string to match input value
    time: { type: String, default: "" },
    ampm: { type: String, enum: ["AM", "PM"], default: "AM" },
  },
  { _id: false }
);

const latestTrailerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    genres: [{ type: String }],
    duration: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },
    year: { type: Number },
    description: { type: String, trim: true },
    thumbnail: { type: String, trim: true }, // filename or URL
    videoId: { type: String, trim: true }, // storing URL (keeps key for backwards compatibility)
    directors: [personSchema],
    producers: [personSchema],
    singers: [personSchema],
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    // common
    type: {
      type: String,
      enum: ["normal", "featured", "releaseSoon", "latestTrailers"],
      default: "normal",
    },

    // basic fields for normal/featured/releaseSoon
    movieName: { type: String, trim: true },
    categories: [{ type: String }],
    poster: { type: String, trim: true }, // filename or URL
    trailerUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    rating: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // total minutes

    // slots & seat pricing (for booking)
    slots: [slotSchema],
    seatPrices: {
      standard: { type: Number, default: 0 },
      recliner: { type: Number, default: 0 },
    },

    // NEW: single auditorium field (matches Booking.auditorium)
    auditorium: { type: String, trim: true, default: "Audi 1" },

    // people / media
    cast: [personSchema], // name + role + file
    directors: [personSchema],
    producers: [personSchema],

    // story / description
    story: { type: String, trim: true },

    // latest trailers (nested)
    latestTrailer: latestTrailerSchema,
  },
  { timestamps: true }
);

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);
export default Movie;
