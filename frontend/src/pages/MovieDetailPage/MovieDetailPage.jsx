// src/pages/MovieDetailPage.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Play,
  X,
  Users,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import { movieDetailHStyles } from "../../assets/dummyStyles";

const API_BASE = "http://localhost:5000";
const ROWS = [
  { id: "A", type: "standard", count: 8 },
  { id: "B", type: "standard", count: 8 },
  { id: "C", type: "standard", count: 8 },
  { id: "D", type: "recliner", count: 8 },
  { id: "E", type: "recliner", count: 8 },
];
const TOTAL_SEATS = ROWS.reduce((s, r) => s + r.count, 0);

const FallbackAvatar = ({ className = "w-12 h-12" }) => (
  <div
    className={`${className} bg-gray-700 rounded-full flex items-center justify-center text-sm text-gray-300`}
    aria-hidden
  >
    ?
  </div>
);

// Function to format duration to hours and minutes
const formatDuration = (duration) => {
  if (!duration) return "N/A";

  // If it's already in "Xh Ym" format, return as is
  if (typeof duration === "string" && /^\d+h\s*\d*m?$/.test(duration)) {
    return duration;
  }

  // If it's a number (in minutes), convert to hours and minutes
  if (typeof duration === "number") {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  }

  // If it's a string that might contain numbers, try to parse
  if (typeof duration === "string") {
    // Try to extract numbers for minutes
    const minutesMatch = duration.match(/(\d+)\s*min/);
    if (minutesMatch) {
      const totalMinutes = parseInt(minutesMatch[1]);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
    }

    // Try to extract hours and minutes separately
    const hoursMatch = duration.match(/(\d+)\s*h/);
    const minsMatch = duration.match(/(\d+)\s*m/);

    if (hoursMatch && minsMatch) {
      return `${hoursMatch[1]}h ${minsMatch[1]}m`;
    } else if (hoursMatch) {
      return `${hoursMatch[1]}h 0m`;
    } else if (minsMatch) {
      const totalMinutes = parseInt(minsMatch[1]);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }

  // Return original if no formatting could be applied
  return duration;
};

function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  if (/^[A-Za-z0-9_-]{6,}$/.test(urlOrId)) return urlOrId;
  const m = String(urlOrId).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i
  );
  return m ? m[1] : null;
}
const getEmbedUrl = (id) =>
  id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
    : null;

const getParts = (dateLike, timeZone) => {
  const dt = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(dt);
  const map = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  map.dayPeriod = map.dayPeriod || map.ampm || map.AMPM || map.ampm;
  return map;
};
const formatDateKey = (dateLike, timeZone = "Asia/Kolkata") => {
  const p = getParts(dateLike, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
};
const formatTimeInTZ = (dateLike, timeZone = "Asia/Kolkata") => {
  const p = getParts(dateLike, timeZone);
  const hour = String(Number(p.hour));
  return `${hour}:${p.minute} ${String(
    p.dayPeriod ?? p.ampm ?? ""
  ).toUpperCase()}`;
};

function normalizeApiBase(b) {
  return String(b || "").replace(/\/+$/, "");
}

// Tiny inline placeholders (no external network dependency)
function makePlaceholderDataUri(width = 96, height = 96, text = "?") {
  const fontSize = Math.max(10, Math.floor(Math.min(width, height) / 2.5));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><rect width='100%' height='100%' fill='#374151' /><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='${fontSize}' fill='#fff'>${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
const PLACEHOLDER_IMG_SM = makePlaceholderDataUri(80, 80, "A");
const PLACEHOLDER_IMG_MD = makePlaceholderDataUri(96, 96, "P");
const PLACEHOLDER_POSTER = makePlaceholderDataUri(320, 480, "No Image");

// Robust client-side normalization for image fields
function getImageUrl(maybe) {
  if (!maybe) return null;

  // handle object forms
  if (typeof maybe === "object") {
    if (Array.isArray(maybe) && maybe.length) return getImageUrl(maybe[0]);
    const possible =
      maybe.url ||
      maybe.path ||
      maybe.filename ||
      maybe.file ||
      maybe.image ||
      maybe.src ||
      maybe.photo ||
      maybe.preview ||
      null;
    if (possible) return getImageUrl(possible);
    return null;
  }

  if (typeof maybe !== "string") return null;
  let s = maybe.trim();
  if (!s) return null;

  // allow inline data URIs
  if (s.startsWith("data:")) return s;

  const apiBase = normalizeApiBase(API_BASE);

  // If it's protocol-relative (//host/...), add http for parsing
  let toParse = s;
  if (toParse.startsWith("//")) toParse = "http:" + toParse;

  // If it looks like "localhost:5000/..." without protocol, prefix http:// so URL can parse
  if (/^localhost[:\/]/i.test(toParse) || /^127\.0\.0\.1[:\/]/.test(toParse)) {
    toParse = "http://" + toParse;
  }

  // If string is absolute http(s) URL -> possibly rewrite localhost to API_BASE
  if (/^https?:\/\//i.test(toParse)) {
    try {
      const parsed = new URL(toParse);
      const host = parsed.hostname.toLowerCase();
      // rewrite localhost/127.0.0.1 to your API_BASE upload path
      if (host === "localhost" || host === "127.0.0.1") {
        // try to extract filename from /uploads/<filename>
        const parts = parsed.pathname.split("/uploads/");
        const filename =
          parts.length > 1 ? parts.pop() : parsed.pathname.split("/").pop();
        if (filename) return `${apiBase}/uploads/${filename}`;
        return `${apiBase}${parsed.pathname}`;
      }
      // otherwise return unchanged absolute URL
      return s;
    } catch (e) {
      // fallthrough to treat as filename
    }
  }

  // Leading slash -> absolute path on API
  if (s.startsWith("/")) return `${apiBase}/${s.replace(/^\/+/, "")}`;

  // If it starts with "uploads/" -> map to apiBase/uploads/..
  if (s.startsWith("uploads/")) return `${apiBase}/${s}`;

  // If it starts with "localhost:..." or "127.0.0.1:..." without protocol
  if (/^localhost[:\/]|^127\.0\.0\.1[:\/]/.test(s)) {
    const parts = s.split("/uploads/");
    const filename = parts.length > 1 ? parts.pop() : s.split("/").pop();
    return `${apiBase}/uploads/${filename}`;
  }

  // Default: treat it as a filename stored in uploads
  return `${apiBase}/uploads/${s.replace(/^uploads\//, "")}`;
}

function to24Hour(timeStr = "00:00", ampm = "") {
  const [hRaw = "0", mRaw = "00"] = String(timeStr).split(":");
  let h = Number(hRaw || 0);
  const m = String(Number(mRaw) || 0).padStart(2, "0");
  const a = (ampm || "").toUpperCase();
  if (a === "AM") {
    if (h === 12) h = 0;
  } else if (a === "PM") {
    if (h !== 12) h = h + 12;
  }
  return `${String(h).padStart(2, "0")}:${m}`;
}

function slotToISO(slot) {
  if (!slot) return null;
  if (typeof slot === "string") return slot;
  if (typeof slot === "object") {
    if (slot.date && (slot.time || slot.datetime || slot.iso)) {
      const date = slot.date;
      const timeStr = slot.time || slot.datetime || slot.iso || "00:00";
      const ampm = slot.ampm || slot.amp || "";
      const hhmm = to24Hour(timeStr, ampm);
      return `${date}T${hhmm}:00+05:30`;
    }
    if (slot.time && !slot.date && slot.datetime) return slot.datetime;
    if (slot.datetime) return slot.datetime;
  }
  return null;
}

export default function MovieDetailPage() {
  const { id: movieIdParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedTrailerId, setSelectedTrailerId] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedMap, setBookedMap] = useState({});

  useEffect(() => {
    let mounted = true;
    (async function fetchMovie() {
      setLoading(true);
      if (!movieIdParam) {
        setMovie(null);
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${API_BASE}/api/movies/${encodeURIComponent(movieIdParam)}`
        );
        const data = res?.data;
        if (!mounted) return;
        if (!data || data.success === false) {
          toast.error((data && data.message) || "Failed to load movie");
          setMovie(null);
        } else {
          const item = data.item || data.data || (data.success ? data : null);
          if (item) {
            if (
              !item.producer &&
              Array.isArray(item.producers) &&
              item.producers.length
            )
              item.producer = item.producers[0];
            // always normalize poster/thumbnail (this rewrites localhost URLs to API_BASE)
            if (
              item.poster &&
              (typeof item.poster === "string" ||
                typeof item.poster === "object")
            ) {
              item.poster = getImageUrl(item.poster) || item.poster;
            }
            if (
              item.thumbnail &&
              (typeof item.thumbnail === "string" ||
                typeof item.thumbnail === "object")
            ) {
              item.thumbnail = getImageUrl(item.thumbnail) || item.thumbnail;
            }
            ["cast", "directors", "producers"].forEach((k) => {
              if (Array.isArray(item[k])) {
                item[k] = item[k].map((p) => {
                  if (!p) return p;
                  const preview =
                    p.preview ||
                    (p.file ? getImageUrl(p.file) : null) ||
                    (p.image ? getImageUrl(p.image) : null);
                  return { ...p, preview, img: p.img || preview };
                });
              }
            });
          }
          setMovie(item || null);
        }
      } catch (err) {
        console.error("Failed to fetch movie:", err);
        toast.error("Failed to fetch movie from server");
        setMovie(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [movieIdParam]);

  useEffect(() => {
    if (!movie && !loading) toast.error("Movie not found.");
  }, [movie, loading]);

  const showtimeDays = useMemo(() => {
    if (!movie) return [];
    const TZ = "Asia/Kolkata";
    const slotsByDate = {};
    const rawSlots =
      (Array.isArray(movie.slots) && movie.slots.length && movie.slots) ||
      (Array.isArray(movie.showtimes) &&
        movie.showtimes.length &&
        movie.showtimes) ||
      (Array.isArray(movie._normalizedSlots) &&
        movie._normalizedSlots.length &&
        movie._normalizedSlots) ||
      [];
    rawSlots.forEach((raw) => {
      try {
        const iso = slotToISO(raw);
        if (!iso) return;
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return;
        const dateKey = formatDateKey(d, TZ);
        if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
        const audi = (raw && raw.audi) || (raw && raw.auditorium) || "Audi 1";
        slotsByDate[dateKey].push({ iso, audi });
      } catch {}
    });
    return Object.keys(slotsByDate)
      .sort()
      .map((key) => {
        const [yy, mm, dd] = key.split("-").map(Number);
        const asDate = new Date(Date.UTC(yy, mm - 1, dd));
        const dayName = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          timeZone: TZ,
        }).format(asDate);
        const shortDay = new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          timeZone: TZ,
        }).format(asDate);
        const dateStr = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          timeZone: TZ,
        }).format(asDate);
        const showtimes = (slotsByDate[key] || [])
          .map(({ iso, audi }) => {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return null;
            return {
              time: formatTimeInTZ(d, TZ),
              datetime: iso,
              timestamp: d.getTime(),
              audi,
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.timestamp - b.timestamp);
        return { date: key, dayName, shortDay, dateStr, showtimes };
      });
  }, [movie]);

  useEffect(() => {
    if (!showtimeDays.length) {
      setSelectedDay(0);
      setSelectedTime(null);
      return;
    }
    setSelectedDay((cur) => (cur >= 0 && cur < showtimeDays.length ? cur : 0));
    setSelectedTime(null);
  }, [showtimeDays]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!movie) {
        setBookedMap({});
        return;
      }
      const movieId = movie._id || movie.id || movieIdParam;
      if (!movieId) {
        setBookedMap({});
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/api/bookings`, {
          params: { movieId, limit: 1000 },
          timeout: 15000,
        });
        const data = res?.data;
        let items = [];
        if (data?.items && Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data)) items = data;
        else if (data?.bookings && Array.isArray(data.bookings))
          items = data.bookings;
        const map = {};
        const blockingStatuses = new Set([
          "pending",
          "paid",
          "active",
          "confirmed",
          "upcoming",
        ]);
        for (const b of items) {
          if (!b) continue;
          const status = String(b.status || "").toLowerCase();
          if (!blockingStatuses.has(status)) continue;
          const show = b.showtime || b.slot || b.datetime || b.time || null;
          if (!show) continue;
          const audi = b.auditorium || b.audi || "Audi 1";
          const seatsArr = Array.isArray(b.seats) ? b.seats : [];
          const seatCount = seatsArr.length;
          const key = `${show}__${audi}`;
          map[key] = (map[key] || 0) + seatCount;
        }
        if (mounted) setBookedMap(map);
      } catch (err) {
        console.error("Failed to fetch bookings for movie:", err);
        if (mounted) setBookedMap({});
      }
    })();
    return () => {
      mounted = false;
    };
  }, [movie, movieIdParam, showtimeDays.length]);

  const openTrailer = (movieObj) => {
    const trailerCandidate =
      movieObj?.trailerUrl ||
      movieObj?.trailer ||
      movieObj?.trailerId ||
      movieObj?.latestTrailer?.videoId ||
      movieObj?.latestTrailer?.url ||
      null;
    const id = extractYouTubeId(trailerCandidate || "");
    if (!id) {
      toast.info("Trailer not available for this movie.");
      return;
    }
    setSelectedMovie(movieObj);
    setSelectedTrailerId(id);
    setShowTrailer(true);
  };
  const closeTrailer = () => {
    setShowTrailer(false);
    setSelectedTrailerId(null);
    setSelectedMovie(null);
  };

  if (loading)
    return (
      <div className={movieDetailHStyles.notFoundContainer}>
        <div className={movieDetailHStyles.notFoundContent}>
          <h2 className={movieDetailHStyles.notFoundTitle}>Loading...</h2>
        </div>
      </div>
    );
  if (!movie)
    return (
      <div className={movieDetailHStyles.notFoundContainer}>
        <div className={movieDetailHStyles.notFoundContent}>
          <h2 className={movieDetailHStyles.notFoundTitle}>Movie not found</h2>
          <Link to="/movies" className={movieDetailHStyles.notFoundLink}>
            Back to movies
          </Link>
        </div>
      </div>
    );

  const buildSeatSelectorPath = (movieIdLocal, datetime) => {
    const key = encodeURIComponent(datetime);
    const usesSingular = (location.pathname || "")
      .toLowerCase()
      .includes("/movie/");
    const mid = movie._id || movie.id || movieIdLocal || movieIdParam;
    return usesSingular
      ? `/movie/${mid}/seat-selector/${key}`
      : `/movies/${mid}/seat-selector/${key}`;
  };
  const handleTimeSelect = (datetime) => {
    setSelectedTime(datetime);
    navigate(
      buildSeatSelectorPath(movie._id || movie.id || movieIdParam, datetime)
    );
  };
  const handleBookNow = () => {
    if (selectedTime)
      navigate(
        buildSeatSelectorPath(
          movie._id || movie.id || movieIdParam,
          selectedTime
        )
      );
    else toast.error("Please select a showtime first");
  };

  const getBookedCountFor = (datetime, audi = "Audi 1") => {
    try {
      const key = `${datetime}__${audi}`;
      if (bookedMap && typeof bookedMap[key] === "number")
        return bookedMap[key];
      const mid = movie._id || movie.id || movieIdParam;
      const keyWithAudi = `bookings_${mid}_${datetime}_${audi}`;
      const rawWith = localStorage.getItem(keyWithAudi);
      if (rawWith) {
        const arr = JSON.parse(rawWith);
        if (Array.isArray(arr)) return arr.length;
      }
      const legacyKey = `bookings_${mid}_${datetime}`;
      const rawLegacy = localStorage.getItem(legacyKey);
      if (rawLegacy) {
        const arrLegacy = JSON.parse(rawLegacy);
        if (Array.isArray(arrLegacy)) return arrLegacy.length;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const posterSrc =
    getImageUrl(movie.img) ||
    getImageUrl(movie.thumbnail) ||
    getImageUrl(movie.poster) ||
    getImageUrl(movie.posterUrl) ||
    PLACEHOLDER_POSTER;

  const categoryList = Array.isArray(movie.categories)
    ? movie.categories
    : Array.isArray(movie.genres)
    ? movie.genres
    : movie.genre
    ? [movie.genre]
    : [];

  const producer =
    movie.producer ||
    (Array.isArray(movie.producers) && movie.producers[0]) ||
    null;
  const producerImg = producer
    ? getImageUrl(producer.img || producer.preview || producer.file)
    : null;

  // Format the duration for display
  const formattedDuration = formatDuration(movie.duration ?? movie.runtime);

  return (
    <div className={movieDetailHStyles.pageContainer}>
      {showTrailer && selectedTrailerId && (
        <div className={movieDetailHStyles.trailerModal}>
          <div className={movieDetailHStyles.trailerContainer}>
            <button
              onClick={closeTrailer}
              className={movieDetailHStyles.closeButton}
              aria-label="Close trailer"
            >
              <X size={36} />
            </button>
            <div className={movieDetailHStyles.trailerIframe}>
              <iframe
                key={selectedTrailerId}
                width="100%"
                height="100%"
                src={getEmbedUrl(selectedTrailerId)}
                title={`${selectedMovie?.title || "Trailer"} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={movieDetailHStyles.iframe}
              />
            </div>
          </div>
        </div>
      )}

      <div className={movieDetailHStyles.mainContainer}>
        <div className={movieDetailHStyles.headerContainer}>
          <Link to="/movies" className={movieDetailHStyles.backButton}>
            <ArrowLeft size={18} />{" "}
            <span className={movieDetailHStyles.backButtonText}>Back</span>
          </Link>
        </div>

        <div className={movieDetailHStyles.titleContainer}>
          <h1
            className={movieDetailHStyles.movieTitle}
            style={{
              fontFamily: "'Cinzel', 'Times New Roman', serif",
              textShadow: "0 4px 20px rgba(220, 38, 38, 0.6)",
              letterSpacing: "0.08em",
            }}
          >
            {movie.title || movie.movieName || "Untitled"}
          </h1>
          <div className={movieDetailHStyles.movieInfoContainer}>
            <span className={movieDetailHStyles.rating}>
              <Star className={movieDetailHStyles.ratingIcon} />
              {movie.rating ?? "N/A"}/10
            </span>
            <span className={movieDetailHStyles.duration}>
              <Clock className={movieDetailHStyles.durationIcon} />
              {formattedDuration}
            </span>
            <span className={movieDetailHStyles.genre}>
              {categoryList.length ? categoryList.join(", ") : "—"}
            </span>
          </div>
        </div>

        <div className={movieDetailHStyles.mainGrid}>
          <div className={movieDetailHStyles.posterContainer}>
            <div className={movieDetailHStyles.posterCard}>
              <div
                className={movieDetailHStyles.posterImageContainer}
                style={{ maxWidth: "320px" }}
              >
                <img
                  src={posterSrc}
                  alt={movie.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://via.placeholder.com/320x480?text=No+Image";
                  }}
                  className={movieDetailHStyles.posterImage}
                />
              </div>
              <button
                onClick={() => openTrailer(movie)}
                className={movieDetailHStyles.trailerButton}
                aria-label="Watch trailer"
              >
                <Play size={18} />
                <span>Watch Trailer</span>
              </button>
            </div>
          </div>

          <div className={movieDetailHStyles.showtimesContainer}>
            <div className={movieDetailHStyles.showtimesCard}>
              <h3
                className={movieDetailHStyles.showtimesTitle}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <Calendar className={movieDetailHStyles.showtimesTitleIcon} />
                <span>Showtimes</span>
              </h3>

              <div className={movieDetailHStyles.daySelection}>
                {showtimeDays.length ? (
                  showtimeDays.map((day, index) => (
                    <button
                      key={day.date}
                      onClick={() => {
                        setSelectedDay(index);
                        setSelectedTime(null);
                      }}
                      className={`${movieDetailHStyles.dayButton} ${
                        selectedDay === index
                          ? movieDetailHStyles.dayButtonSelected
                          : movieDetailHStyles.dayButtonDefault
                      }`}
                      aria-pressed={selectedDay === index}
                      aria-label={`Select ${day.dayName} ${day.dateStr}`}
                    >
                      <div className={movieDetailHStyles.dayName}>
                        {day.shortDay}
                      </div>
                      <div className={movieDetailHStyles.dayDate}>
                        {day.dateStr}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm px-2">
                    No showtime dates available
                  </div>
                )}
              </div>

              <div className={movieDetailHStyles.showtimesGrid}>
                {showtimeDays[selectedDay]?.showtimes &&
                showtimeDays[selectedDay].showtimes.length ? (
                  showtimeDays[selectedDay].showtimes.map((showtime, index) => {
                    const bookedCount = getBookedCountFor(
                      showtime.datetime,
                      showtime.audi
                    );
                    const isSoldOut = bookedCount >= TOTAL_SEATS;
                    return (
                      <button
                        key={index}
                        onClick={() => handleTimeSelect(showtime.datetime)}
                        className={`${movieDetailHStyles.showtimeButton} ${
                          selectedTime === showtime.datetime
                            ? movieDetailHStyles.showtimeButtonSelected
                            : movieDetailHStyles.showtimeButtonDefault
                        }`}
                        title={
                          isSoldOut
                            ? "All seats booked for this showtime"
                            : `Seats available: ${Math.max(
                                0,
                                TOTAL_SEATS - bookedCount
                              )}`
                        }
                        aria-disabled={isSoldOut}
                        disabled={isSoldOut}
                      >
                        <span>{showtime.time}</span>
                        {isSoldOut && (
                          <span className={movieDetailHStyles.soldOutBadge}>
                            Sold Out
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className={movieDetailHStyles.noShowtimes}>
                    No showtimes available for the selected date
                  </div>
                )}
              </div>

              {selectedTime && (
                <div className={movieDetailHStyles.bookNowContainer}>
                  <button
                    onClick={handleBookNow}
                    className={movieDetailHStyles.bookNowButton}
                    aria-label="Proceed to seat selection"
                  >
                    Proceed to Seat Selection
                  </button>
                </div>
              )}
            </div>

            <div className={movieDetailHStyles.castCard}>
              <h3
                className={movieDetailHStyles.castTitle}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <Users className={movieDetailHStyles.castTitleIcon} />
                <span>Cast</span>
              </h3>
              <div className={movieDetailHStyles.castGrid}>
                {movie.cast && movie.cast.length ? (
                  movie.cast.map((c, idx) => (
                    <div key={idx} className={movieDetailHStyles.castMember}>
                      <div className={movieDetailHStyles.castImageContainer}>
                        {c.img || c.preview || c.file ? (
                          (() => {
                            const src =
                              getImageUrl(c.img || c.preview || c.file) ||
                              PLACEHOLDER_IMG_SM;
                            return (
                              <img
                                src={src}
                                alt={c.name}
                                loading="lazy"
                                className={movieDetailHStyles.castImage}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = PLACEHOLDER_IMG_SM;
                                }}
                              />
                            );
                          })()
                        ) : (
                          <FallbackAvatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
                        )}
                      </div>
                      <div className={movieDetailHStyles.castName}>
                        {c.name}
                      </div>
                      <div className={movieDetailHStyles.castRole}>
                        {c.role}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={movieDetailHStyles.noCastMessage}>
                    No cast data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={movieDetailHStyles.storyCard}>
          <h2
            className={movieDetailHStyles.storyTitle}
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Story
          </h2>
          <p className={movieDetailHStyles.storyText}>
            {movie.story || movie.description || movie.synopsis}
          </p>
        </div>

        <div className={movieDetailHStyles.crewGrid}>
          <div className={movieDetailHStyles.crewCard}>
            <div className={movieDetailHStyles.crewTitle}>
              <User className={movieDetailHStyles.crewIcon} />
              <h3 style={{ fontFamily: "'Cinzel', serif" }}>Director</h3>
            </div>
            <div className={movieDetailHStyles.crewContent}>
              {(() => {
                const directors = Array.isArray(movie.directors)
                  ? movie.directors
                  : movie.director
                  ? [movie.director]
                  : [];
                return (
                  <div className={movieDetailHStyles.crewGridInner}>
                    {directors.length ? (
                      directors.slice(0, 2).map((d, i) => (
                        <div key={i} className="flex flex-col items-center">
                          {d?.img || d?.preview || d?.file ? (
                            (() => {
                              const src =
                                getImageUrl(d.img || d.preview || d.file) ||
                                PLACEHOLDER_IMG_MD;
                              return (
                                <img
                                  src={src}
                                  alt={d.name || `Director ${i + 1}`}
                                  loading="lazy"
                                  className={movieDetailHStyles.crewImage}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = PLACEHOLDER_IMG_MD;
                                  }}
                                />
                              );
                            })()
                          ) : (
                            <div className={movieDetailHStyles.fallbackAvatar}>
                              ?
                            </div>
                          )}

                          <div className={movieDetailHStyles.crewName}>
                            {d?.name ?? "N/A"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className={movieDetailHStyles.fallbackAvatar}>
                          ?
                        </div>
                        <div className={movieDetailHStyles.crewName}>N/A</div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className={movieDetailHStyles.crewCard}>
            <div className={movieDetailHStyles.crewTitle}>
              <User className={movieDetailHStyles.crewIcon} />
              <h3 style={{ fontFamily: "'Cinzel', serif" }}>Producer</h3>
            </div>
            <div className={movieDetailHStyles.crewContent}>
              {producerImg ? (
                <img
                  src={producerImg || PLACEHOLDER_IMG_MD}
                  alt={producer?.name}
                  loading="lazy"
                  className={movieDetailHStyles.crewImage}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACEHOLDER_IMG_MD;
                  }}
                />
              ) : (
                <FallbackAvatar className="w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4" />
              )}
              <div className={movieDetailHStyles.crewName}>
                {producer?.name ?? "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{movieDetailHStyles.customCSS}</style>
    </div>
  );
}
