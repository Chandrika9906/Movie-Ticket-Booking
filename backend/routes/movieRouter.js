import express from "express";
import multer from "multer";
import path from "path";
import {
  createMovie,
  getMovies,
  getMovieById,
  deleteMovie,
} from "../controllers/moviesController.js";

const movieRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads")); // ➜ ./uploads
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e5);
    const ext = path.extname(file.originalname);
    // prefix for clarity
    cb(null, `movie-${unique}${ext}`);
  },
});

const upload = multer({ storage }).fields([
  { name: "poster", maxCount: 1 },
  { name: "trailerUrl", maxCount: 1 },
  { name: "videoUrl", maxCount: 1 },
  { name: "ltThumbnail", maxCount: 1 }, // ✅ FIXED name
  { name: "castFiles", maxCount: 20 },
  { name: "directorFiles", maxCount: 20 },
  { name: "producerFiles", maxCount: 20 },
  { name: "ltDirectorFiles", maxCount: 20 },
  { name: "ltProducerFiles", maxCount: 20 },
  { name: "ltSingerFiles", maxCount: 20 },
]);

movieRouter.post("/", upload, createMovie);
movieRouter.get("/", getMovies);
movieRouter.get("/:id", getMovieById);
movieRouter.delete("/:id", deleteMovie);

export default movieRouter;
