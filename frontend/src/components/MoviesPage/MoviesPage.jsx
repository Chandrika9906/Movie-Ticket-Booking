import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { moviesPageStyles } from "../../assets/dummyStyles";

const API_BASE = "http://localhost:5000";
const COLLAPSE_COUNT = 12;
const PLACEHOLDER = "https://via.placeholder.com/400x600?text=No+Poster";

function getUploadUrl(maybe) {
  if (!maybe) return null;
  if (typeof maybe !== "string") return null;
  if (maybe.startsWith("http://") || maybe.startsWith("https://")) {
    if (/localhost:\d+/.test(maybe)) {
      try {
        const url = new URL(maybe);
        const filename = url.pathname.split('/uploads/').pop();
        return `${API_BASE}/uploads/${filename}`;
      } catch (e) {
        return maybe;
      }
    }
    return maybe;
  }

  // relative or "uploads/..." -> build with API_BASE
  const cleaned = String(maybe).replace(/^uploads\//, "");
  return `${API_BASE}/uploads/${cleaned}`;
}

const categoriesList = [
  { id: "all", name: "All Movies" },
  { id: "action", name: "Action" },
  { id: "horror", name: "Horror" },
  { id: "comedy", name: "Comedy" },
  { id: "adventure", name: "Adventure" },
];

const mapBackendMovie = (m) => {
  const id = m._id || m.id || "";
  const title = m.movieName || m.title || "Untitled";
  const rawImg = m.poster || m.latestTrailer?.thumbnail || m.thumbnail || null;
  const image = getUploadUrl(rawImg) || PLACEHOLDER;

  // pick first category (normalize to lowercase for category id comparisons)
  const cat =
    (Array.isArray(m.categories) && m.categories[0]) ||
    m.category ||
    (Array.isArray(m.latestTrailer?.genres) && m.latestTrailer.genres[0]) ||
    "General";

  const category = String(cat || "General");

  return { id, title, image, category, raw: m };
};

export default function MoviesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch normal movies on mount
  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // ask backend for normal movies first
        const url = `${API_BASE}/api/movies?type=normal&limit=200`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json.items) ? json.items : [];

        // map backend shape to frontend shape
        const mapped = items.map(mapBackendMovie);
        if (mounted) {
          setMovies(mapped);
          setLoading(false);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load movies:", err);
        // fallback: try a generic fetch for any movies
        try {
          const res2 = await fetch(`${API_BASE}/api/movies?limit=200`);
          if (!res2.ok) throw new Error(`Fallback HTTP ${res2.status}`);
          const json2 = await res2.json();
          const items2 = Array.isArray(json2.items) ? json2.items : [];
          const mapped2 = items2.map(mapBackendMovie);
          if (mounted) {
            setMovies(mapped2);
            setLoading(false);
          }
        } catch (err2) {
          if (err2.name === "AbortError") return;
          console.error("Movies fallback failed:", err2);
          if (mounted) {
            setError("Unable to load movies.");
            setLoading(false);
          }
        }
      }
    }

    load();
    return () => {
      mounted = false;
      ac.abort();
    };
  }, []);

  // hide expanded list when category changes
  useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  // filter by category (case-insensitive)
  const filteredMovies = React.useMemo(() => {
    if (activeCategory === "all") return movies;
    return movies.filter(
      (m) =>
        String(m.category || "").toLowerCase() ===
        String(activeCategory || "").toLowerCase()
    );
  }, [movies, activeCategory]);

  const visibleMovies = showAll
    ? filteredMovies
    : filteredMovies.slice(0, COLLAPSE_COUNT);

  return (
    <div className={moviesPageStyles.container}>
      <section className={moviesPageStyles.categoriesSection}>
        <div className={moviesPageStyles.categoriesContainer}>
          <div className={moviesPageStyles.categoriesFlex}>
            {categoriesList.map((category) => (
              <button
                key={category.id}
                className={`${moviesPageStyles.categoryButton.base} ${
                  activeCategory === category.id
                    ? moviesPageStyles.categoryButton.active
                    : moviesPageStyles.categoryButton.inactive
                }`}
                onClick={() => setActiveCategory(category.id)}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={moviesPageStyles.moviesSection}>
        <div className={moviesPageStyles.moviesContainer}>
          {loading ? (
            <div className="py-12 text-center text-gray-300">
              Loading movies…
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-400">{error}</div>
          ) : (
            <>
              <div className={moviesPageStyles.moviesGrid}>
                {visibleMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movies/${movie.id}`}
                    state={{ movie: movie.raw }}
                    aria-label={`Open details for ${movie.title}`}
                    className={moviesPageStyles.movieCard}
                  >
                    <div className={moviesPageStyles.movieImageContainer}>
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className={moviesPageStyles.movieImage}
                      />
                    </div>

                    <div className={moviesPageStyles.movieInfo}>
                      <h3 className={moviesPageStyles.movieTitle}>
                        {movie.title}
                      </h3>
                      <div className={moviesPageStyles.movieCategory}>
                        <span className={moviesPageStyles.movieCategoryText}>
                          {movie.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {filteredMovies.length === 0 && (
                  <div className={moviesPageStyles.emptyState}>
                    No movies found in this category.
                  </div>
                )}
              </div>

              {filteredMovies.length > COLLAPSE_COUNT && (
                <div className={moviesPageStyles.showMoreContainer}>
                  <button
                    onClick={() => setShowAll((p) => !p)}
                    className={moviesPageStyles.showMoreButton}
                    aria-expanded={showAll}
                    type="button"
                  >
                    {showAll
                      ? "Show less"
                      : `Show more (${
                          filteredMovies.length - COLLAPSE_COUNT
                        } more)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
