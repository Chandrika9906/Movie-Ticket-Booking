// controllers/movieSyncController.js
import Movie from "../models/movieModel.js";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

async function tmdbFetch(path) {
  const url = `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}): ${path}`);
  }
  return res.json();
}

export async function syncMoviesFromTMDB(req, res) {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "TMDB_API_KEY is missing in server env",
      });
    }

    // pull one page of upcoming releases — expand to more pages later if needed
    const upcoming = await tmdbFetch("/movie/upcoming?page=1");
    const results = Array.isArray(upcoming.results) ? upcoming.results : [];

    const added = [];
    const skipped = [];
    const failed = [];

    for (const item of results) {
      const title = (item.title || item.original_title || "").trim();
      if (!title) continue;

      // duplicate check by name (case-insensitive)
      const existing = await Movie.findOne({
        movieName: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      }).lean();

      if (existing) {
        skipped.push(title);
        continue;
      }

      try {
        // fetch full details for runtime + genre names (upcoming list doesn't include these)
        const details = await tmdbFetch(`/movie/${item.id}`);

        const doc = await Movie.create({
          type: "releaseSoon",
          movieName: title,
          categories: Array.isArray(details.genres)
            ? details.genres.map((g) => g.name).filter(Boolean)
            : [],
          poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : "",
          rating: typeof item.vote_average === "number" ? Number(item.vote_average.toFixed(1)) : 0,
          duration: typeof details.runtime === "number" ? details.runtime : 0,
          story: item.overview || details.overview || "",
          seatPrices: { standard: 0, recliner: 0 }, // admin must set before it's bookable
          slots: [], // admin must add showtimes
          auditorium: "Audi 1",
        });

        added.push({ id: doc._id, title });
      } catch (err) {
        console.error(`Failed to sync "${title}":`, err.message);
        failed.push(title);
      }
    }

    return res.json({
      success: true,
      message: `Synced: ${added.length} added, ${skipped.length} skipped (already exist), ${failed.length} failed`,
      added,
      skipped,
      failed,
    });
  } catch (err) {
    console.error("syncMoviesFromTMDB error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while syncing movies",
      error: String(err.message || err),
    });
  }
}

export default { syncMoviesFromTMDB };