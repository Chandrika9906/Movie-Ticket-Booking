// src/components/Trailers.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock,
  Calendar,
  X,
} from "lucide-react";
import { trailersStyles, trailersCSS } from "../../assets/dummyStyles";

const API_BASE = "http://localhost:5000";
const PLACEHOLDER_THUMB =
  "https://via.placeholder.com/800x450?text=No+Thumbnail";
  
const _stripTrailing = (s = "") => s.replace(/\/+$/, "");

const getUploadUrl = (input) => {
  if (!input) return null;

  const apiBase = _stripTrailing(API_BASE);

  // strings
  if (typeof input === "string") {
    const val = input.trim();
    // allow data urls through
    if (val.startsWith("data:")) return val;

    // absolute http(s) URLs
    if (/^https?:\/\//i.test(val)) {
      try {
        const parsed = new URL(val);
        const host = parsed.hostname.toLowerCase();
        // if it's a localhost URL returned by some dev backend, rewrite to API_BASE
        if (host === "localhost" || host === "127.0.0.1") {
          // try to extract filename after /uploads/ else fallback to last path segment
          const parts = val.split("/uploads/");
          const filename =
            parts.length > 1 ? parts.pop() : parsed.pathname.split("/").pop();
          return `${apiBase}/uploads/${filename}`;
        }
        // external URL — return as-is
        return val;
      } catch (e) {
        // fall through to filename handling
      }
    }

    // absolute path like "/uploads/xxx.png"
    if (val.startsWith("/")) {
      return `${apiBase}/${val.replace(/^\/+/, "")}`;
    }

    // path starting with "uploads/..."
    if (val.startsWith("uploads/")) {
      return `${apiBase}/${val}`;
    }

    // plain filename like "movie-123.png"
    return `${apiBase}/uploads/${val}`;
  }

  // objects (multer-like or nested)
  if (typeof input === "object") {
    // common candidate keys
    const candidates = [
      "url",
      "path",
      "filename",
      "file",
      "image",
      "photo",
      "thumbnail",
      "src",
    ];
    for (const k of candidates) {
      if (input[k]) return getUploadUrl(input[k]);
    }
    // arrays: try first element
    if (Array.isArray(input) && input.length) return getUploadUrl(input[0]);
  }

  return null;
};

const formatDuration = (dur) => {
  if (!dur) return "";
  if (typeof dur === "string") return dur;
  if (typeof dur === "number") return `${dur}m`;
  // object with hours/minutes
  const h = dur.hours ?? 0;
  const m = dur.minutes ?? 0;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  if (m) return `${m}m`;
  return "";
};

const mapMovieToTrailerItem = (movie) => {
  const title = movie.movieName || movie.title || "Untitled";
  const thumbnail = getUploadUrl(movie.poster) || getUploadUrl(movie.thumbnail) || PLACEHOLDER_THUMB;
  const videoUrl = movie.trailerUrl || movie.videoUrl || "";
  const duration = movie.duration ? formatDuration(movie.duration) : "";
  const year = movie.year || "";
  const genre = movie.categories && movie.categories.length ? movie.categories.join(", ") : "";
  const description = movie.story || "";

  const credits = {};
  const firstDirector = (movie.directors || []).find(Boolean);
  const firstProducer = (movie.producers || []).find(Boolean);
  const firstSinger = (movie.cast || []).find(Boolean); // no singers field in your data — cast is closest

  if (firstDirector) {
    credits["Director"] = {
      name: firstDirector.name || "Unknown",
      image: getUploadUrl(firstDirector.preview) || PLACEHOLDER_THUMB,
    };
  }
  if (firstProducer) {
    credits["Producer"] = {
      name: firstProducer.name || "Unknown",
      image: getUploadUrl(firstProducer.preview) || PLACEHOLDER_THUMB,
    };
  }
  if (firstSinger) {
    credits["Cast"] = {
      name: firstSinger.name || "Unknown",
      image: getUploadUrl(firstSinger.preview) || PLACEHOLDER_THUMB,
    };
  }

  return {
    id: movie._id || movie.id,
    title,
    thumbnail,
    videoUrl,
    duration,
    year,
    genre,
    description,
    credits,
  };
};

const Trailers = () => {
  const [trailers, setTrailers] = useState([]);
  const [featuredTrailer, setFeaturedTrailer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    async function load() {
      try {
        // request latestTrailers type from backend
        const url = `${API_BASE}/api/movies?type=featured&limit=50`;
        const res = await fetch(url, { signal: ac.signal });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json.items) ? json.items : [];
        // map each movie doc to the trailer item the UI expects
        const mapped = items.map(mapMovieToTrailerItem);
        console.log(mapped);
        setTrailers(mapped);
        setFeaturedTrailer(mapped[0] || null);
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load trailers", err);
        setError("Failed to load trailers");
        setLoading(false);
      }
    }

    load();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    // no-op kept for parity with original code
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const selectTrailer = (trailer) => {
    setFeaturedTrailer(trailer);

    setIsPlaying(false);
    try {
      if (videoRef.current) {
        // iframe ref not directly controllable, but preserve reset semantics
        videoRef.current.currentTime = 0;
      }
    } catch (e) {
      /* ignore */
    }

    // center selected item in carousel
    try {
      if (carouselRef.current) {
        const el = carouselRef.current.querySelector(
          `[data-id='${trailer.id}']`
        );
        if (el) {
          const rect = el.getBoundingClientRect();
          const parentRect = carouselRef.current.getBoundingClientRect();
          const offset =
            rect.left - parentRect.left - parentRect.width / 2 + rect.width / 2;
          carouselRef.current.scrollBy({ left: offset, behavior: "smooth" });
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const togglePlay = () => {
    setIsPlaying((s) => !s);
  };

  // helper to build embed URL for common providers (YouTube / youtu.be / Vimeo)
  const getEmbedBaseUrl = (videoUrl) => {
    if (!videoUrl) return "";
    try {
      const url = new URL(videoUrl);
      const host = url.hostname.replace("www.", "").toLowerCase();

      // YouTube standard watch URL: youtube.com/watch?v=ID
      if (host.includes("youtube.com")) {
        const vid = url.searchParams.get("v");
        if (vid) return `https://www.youtube.com/embed/${vid}`;
        // If already embed path, return that
        if (url.pathname.includes("/embed/"))
          return `https://www.youtube.com${url.pathname}`;
      }

      // short youtu.be links
      if (host === "youtu.be") {
        const vid = url.pathname.replace("/", "");
        if (vid) return `https://www.youtube.com/embed/${vid}`;
      }

      // Vimeo
      if (host.includes("vimeo.com")) {
        const parts = url.pathname.split("/").filter(Boolean);
        const id = parts.pop();
        if (id) return `https://player.vimeo.com/video/${id}`;
      }

      // fallback: return original (could already be an embed URL)
      return videoUrl;
    } catch (e) {
      // if URL constructor fails, return as-is
      return videoUrl || "";
    }
  };

  // build final iframe src with autoplay/mute parameters
  const buildIframeSrc = (videoUrl) => {
    const base = getEmbedBaseUrl(videoUrl);
    if (!base) return "";
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}autoplay=1&mute=${isMuted ? 1 : 0}&rel=0`;
  };

  // rendering
  if (loading) {
    return (
      <div className={trailersStyles.container}>
        <div className="py-12 text-center text-gray-300">Loading trailers…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={trailersStyles.container}>
        <div className="py-12 text-center text-red-400">{error}</div>
      </div>
    );
  }

  // fallback if backend returned none: keep UI but empty
  const dataToRender = trailers || [];

  return (
    <div className={trailersStyles.container}>
      <main className={trailersStyles.main}>
        <div className={trailersStyles.layout}>
          {/* Left - list */}
          <div className={trailersStyles.leftSide}>
            <div className={trailersStyles.leftCard}>
              <h2
                className={trailersStyles.leftTitle}
                style={{ fontFamily: "Monoton, cursive" }}
              >
                <Clapperboard className={trailersStyles.titleIcon} />
                Latest Trailers
              </h2>

              <div className={trailersStyles.carouselControls}>
                <div className={trailersStyles.controlButtons}>
                  <button
                    onClick={scrollLeft}
                    className={trailersStyles.controlButton}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={scrollRight}
                    className={trailersStyles.controlButton}
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <span className={trailersStyles.trailerCount}>
                  {dataToRender.length} trailers
                </span>
              </div>

              <div
                ref={carouselRef}
                className={trailersStyles.carousel}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                aria-label="Trailers carousel"
              >
                {dataToRender.map((trailer) => (
                  <div
                    key={trailer.id}
                    data-id={trailer.id}
                    className={`${trailersStyles.carouselItem.base} ${
                      featuredTrailer && featuredTrailer.id === trailer.id
                        ? trailersStyles.carouselItem.active
                        : trailersStyles.carouselItem.inactive
                    }`}
                    style={{
                      width: "220px",
                      height: "124px",
                      minWidth: "220px",
                    }}
                    onClick={() => selectTrailer(trailer)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        selectTrailer(trailer);
                    }}
                    aria-pressed={
                      featuredTrailer && featuredTrailer.id === trailer.id
                    }
                  >
                    <img
                      src={trailer.thumbnail || PLACEHOLDER_THUMB}
                      alt={trailer.title}
                      className={trailersStyles.carouselImage}
                      loading="lazy"
                    />
                    <div className={trailersStyles.carouselOverlay}>
                      <h3 className={trailersStyles.carouselTitle}>
                        {trailer.title}
                      </h3>
                      <p className={trailersStyles.carouselGenre}>
                        {trailer.genre}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={trailersStyles.trendingSection}>
                <h3 className={trailersStyles.trendingTitle}>Now Trending</h3>
                {dataToRender.slice(0, 3).map((trailer) => (
                  <div
                    key={trailer.id}
                    className={trailersStyles.trendingItem}
                    onClick={() => selectTrailer(trailer)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        selectTrailer(trailer);
                    }}
                  >
                    <div className={trailersStyles.trendingImage}>
                      <img
                        src={trailer.thumbnail || PLACEHOLDER_THUMB}
                        alt={trailer.title}
                        className={trailersStyles.trendingImageSrc}
                        loading="lazy"
                      />
                    </div>
                    <div className={trailersStyles.trendingContent}>
                      <h4 className={trailersStyles.trendingItemTitle}>
                        {trailer.title}
                      </h4>
                      <p className={trailersStyles.trendingItemGenre}>
                        {trailer.genre}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - featured */}
          <div className={trailersStyles.rightSide}>
            <div className={trailersStyles.rightCard}>
              <div className={trailersStyles.videoContainer}>
                {isPlaying && featuredTrailer && featuredTrailer.videoUrl ? (
                  <div className={trailersStyles.videoWrapper}>
                    <iframe
                      className={trailersStyles.videoIframe}
                      src={buildIframeSrc(featuredTrailer.videoUrl)}
                      title={featuredTrailer.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      ref={videoRef}
                    />
                    <div className={trailersStyles.closeButton}>
                      <button
                        onClick={() => setIsPlaying(false)}
                        className={trailersStyles.closeButtonInner}
                        aria-label="Close video"
                        title="Close"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : featuredTrailer ? (
                  <div className={trailersStyles.thumbnailContainer}>
                    <img
                      src={featuredTrailer.thumbnail || PLACEHOLDER_THUMB}
                      alt={featuredTrailer.title}
                      className={trailersStyles.thumbnailImage}
                      loading="eager"
                    />
                    <div className={trailersStyles.playButtonContainer}>
                      <button
                        onClick={togglePlay}
                        className={trailersStyles.playButton}
                        aria-label="Play trailer"
                      >
                        <Play size={32} fill="white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={trailersStyles.thumbnailContainer}>
                    <img
                      src={PLACEHOLDER_THUMB}
                      alt="No trailer selected"
                      className={trailersStyles.thumbnailImage}
                    />
                  </div>
                )}
              </div>

              {featuredTrailer && (
                <div className={trailersStyles.trailerInfo}>
                  <div className={trailersStyles.infoHeader}>
                    <h2 className={trailersStyles.trailerTitle}>
                      {featuredTrailer.title}
                    </h2>

                    <div className={trailersStyles.trailerMeta}>
                      <span className={trailersStyles.metaItem}>
                        <Clock size={16} className={trailersStyles.metaIcon} />
                        {featuredTrailer.duration}
                      </span>
                      <span className={trailersStyles.metaItem}>
                        <Calendar
                          size={16}
                          className={trailersStyles.metaIcon}
                        />
                        {featuredTrailer.year}
                      </span>
                    </div>
                  </div>

                  <div className={trailersStyles.genreContainer}>
                    {String(featuredTrailer.genre || "")
                      .split(",")
                      .filter(Boolean)
                      .map((genre, index) => (
                        <span key={index} className={trailersStyles.genreTag}>
                          {genre.trim()}
                        </span>
                      ))}
                  </div>

                  <p className={trailersStyles.description}>
                    {featuredTrailer.description}
                  </p>

                  <div className={trailersStyles.credits}>
                    <h3 className={trailersStyles.creditsTitle}>Credits</h3>
                    <div className={trailersStyles.creditsGrid}>
                      {featuredTrailer.credits &&
                        Object.entries(featuredTrailer.credits).map(
                          ([role, person]) => (
                            <div
                              key={role}
                              className={trailersStyles.creditItem}
                            >
                              <div className={trailersStyles.creditImage}>
                                <img
                                  src={person.image || PLACEHOLDER_THUMB}
                                  alt={person.name}
                                  className={trailersStyles.creditImageSrc}
                                  loading="lazy"
                                />
                              </div>
                              <div className={trailersStyles.creditName}>
                                {person.name}
                              </div>
                              <div className={trailersStyles.creditRole}>
                                {role}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{trailersCSS}</style>
    </div>
  );
};

export default Trailers;
