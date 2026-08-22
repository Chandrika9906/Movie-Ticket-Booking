import React, { useEffect, useState } from "react";
import { Tickets } from "lucide-react";
import { Link } from "react-router-dom";
import { moviesStyles } from "../../assets/dummyStyles";

const API_BASE = "http://localhost:5000";
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

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    async function loadFeaturedMovies() {
      try {
        const url = `${API_BASE}/api/movies?featured&limit=100`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const json = await res.json();

        const items = json.items ?? (Array.isArray(json) ? json : []);

        // Keep only featured items
        const featuredOnly = items.filter(
          (it) =>
            it?.featured === true ||
            it?.isFeatured === true ||
            String(it?.type)?.toLowerCase() === "featured"
        );

        // ✅ Show only featured movies, even if none
        setMovies(featuredOnly.slice(0, 6));
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Movies load error:", err);
        setError("Unable to load featured movies.");
        setLoading(false);
      }
    }

    loadFeaturedMovies();
    return () => ac.abort();
  }, []);

  return (
    <section className={moviesStyles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');
      `}</style>

      <h2
        className={moviesStyles.title}
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        Featured Movies
      </h2>

      {loading ? (
        <div className="text-gray-300 py-12 text-center">Loading movies…</div>
      ) : error ? (
        <div className="text-red-400 py-12 text-center">{error}</div>
      ) : movies.length === 0 ? (
        <div className="text-gray-400 py-12 text-center">
          No featured movies found.
        </div>
      ) : (
        <div className={moviesStyles.grid}>
          {movies.map((m) => {
            const rawImg =
              m.poster || m.latestTrailer?.thumbnail || m.thumbnail || null;
            const imgSrc = getUploadUrl(rawImg) || PLACEHOLDER;
            const title = m.movieName || m.title || "Untitled";
            const category =
              (Array.isArray(m.categories) && m.categories[0]) ||
              m.category ||
              "General";
            const movieId = m._id || m.id || title;

            return (
              <article
                key={movieId}
                className={moviesStyles.movieArticle}
                aria-labelledby={`movie-title-${movieId}`}
              >
                <Link
                  to={`/movie/${movieId}`}
                  className={moviesStyles.movieLink}
                  aria-label={`Open ${title} details`}
                >
                  <img
                    src={imgSrc}
                    alt={title}
                    loading="lazy"
                    className={moviesStyles.movieImage}
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                </Link>

                <div className={moviesStyles.movieInfo}>
                  <div className={moviesStyles.titleContainer}>
                    <Tickets
                      className={moviesStyles.ticketsIcon}
                      aria-hidden="true"
                    />
                    <span
                      id={`movie-title-${movieId}`}
                      className={moviesStyles.movieTitle}
                      style={{ fontFamily: "'Pacifico', cursive" }}
                    >
                      {title}
                    </span>
                  </div>

                  <div className={moviesStyles.categoryContainer}>
                    <span className={moviesStyles.categoryText}>
                      {category}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
