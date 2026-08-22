// src/components/ReleasesPage.jsx
import React, { useEffect, useState } from "react";
import { releasesStyles } from "../../assets/dummyStyles";

const API_BASE = "http://localhost:5000";
const PLACEHOLDER_IMG = "https://via.placeholder.com/400x600?text=No+Image";

const normalizeApiBase = (base) => base.replace(/\/+$/, ""); // remove trailing slash

const getUploadUrl = (maybeFilenameOrUrl) => {
  if (!maybeFilenameOrUrl || typeof maybeFilenameOrUrl !== "string") return null;

  const apiBase = normalizeApiBase(API_BASE);

  // Case A: already a full URL
  if (/^https?:\/\//i.test(maybeFilenameOrUrl)) {
    try {
      const parsed = new URL(maybeFilenameOrUrl);
      // If it points to localhost (dev artifact), rewrite to API_BASE/uploads/<file>
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        // attempt to extract filename after /uploads/
        const parts = maybeFilenameOrUrl.split("/uploads/");
        const filename = parts.length > 1 ? parts.pop() : parsed.pathname.split("/").pop();
        return `${apiBase}/uploads/${filename}`;
      }
      // else return as-is (external absolute url)
      return maybeFilenameOrUrl;
    } catch (e) {
      // if URL parsing fails, fall through to filename handling
    }
  }

  // Case B: value looks like a path that may already include uploads/
  if (maybeFilenameOrUrl.startsWith("/")) {
    // strip leading slash then append to API_BASE
    return `${apiBase}/${maybeFilenameOrUrl.replace(/^\/+/, "")}`;
  }

  // Case C: plain filename or "uploads/filename"
  return `${apiBase}/uploads/${maybeFilenameOrUrl.replace(/^uploads\//, "")}`;
};

const mapBackendMovieToUi = (m) => {
  // backend returns poster (full URL or filename) and also latestTrailer.thumbnail etc.
  const poster =
    m.poster || (m.latestTrailer && m.latestTrailer.thumbnail) || null;
  const image = getUploadUrl(poster) || PLACEHOLDER_IMG;

  // display a category string (pick categories array or latestTrailer.genres)
  const category =
    (Array.isArray(m.categories) && m.categories.join(", ")) ||
    (m.latestTrailer &&
      Array.isArray(m.latestTrailer.genres) &&
      m.latestTrailer.genres.join(", ")) ||
    "";

  return {
    id: m._id || m.id,
    title:
      m.movieName ||
      m.title ||
      (m.latestTrailer && m.latestTrailer.title) ||
      "Untitled",
    image,
    category,
    raw: m,
  };
};

const ReleasesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // ask backend for releaseSoon type (adjust query if your backend uses a different filter)
        const url = `${API_BASE}/api/movies?type=releaseSoon&limit=100`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json.items)
          ? json.items
          : Array.isArray(json.data)
          ? json.data
          : [];
        const mapped = (items || []).map(mapBackendMovieToUi);
        if (!cancelled) setMovies(mapped);
      } catch (err) {
        console.error("Failed to load release movies", err);
        if (!cancelled) setError("Failed to load releases");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={releasesStyles.pageContainer}>
      <div className={releasesStyles.headerContainer}>
        <h1 className={releasesStyles.headerTitle}>RELEASES SOON</h1>
        <p className={releasesStyles.headerSubtitle}>
          Latest Movies • Now Showing
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "#999" }}>
          Loading releases…
        </div>
      ) : error ? (
        <div style={{ padding: 32, textAlign: "center", color: "red" }}>
          {error}
        </div>
      ) : movies.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "#777" }}>
          No upcoming releases found.
        </div>
      ) : (
        <div className={releasesStyles.movieGrid}>
          {movies.map((movie) => (
            <div key={movie.id} className={releasesStyles.movieCard}>
              <div className={releasesStyles.imageContainer}>
                <img
                  src={movie.image}
                  alt={movie.title}
                  className={releasesStyles.movieImage}
                  loading="lazy"
                />
              </div>

              <div className={releasesStyles.movieInfo}>
                <h3 className={releasesStyles.movieTitle}>{movie.title}</h3>
                <p className={releasesStyles.movieCategory}>{movie.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReleasesPage;
