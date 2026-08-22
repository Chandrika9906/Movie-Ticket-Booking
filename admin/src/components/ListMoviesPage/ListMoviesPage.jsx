// src/pages/ListMoviesPage.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Film,
  Play,
  Star,
  Clock,
  Calendar,
  Ticket,
  Play as PlayIcon,
  Search,
  X,
} from "lucide-react";
import { styles5, customStyles } from "../../assets/dummyStyles";

const API_BASE = "https://movie-ticket-booking-backend-llot.onrender.com";

// ---------- helpers ----------
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

function getImageUrl(maybe) {
  if (!maybe) return null;

  if (typeof maybe === "object") {
    if (Array.isArray(maybe) && maybe.length) {
      return getImageUrl(maybe[0]);
    }

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

    return possible ? getImageUrl(possible) : null;
  }

  if (typeof maybe !== "string") return null;

  let s = maybe.trim();
  if (!s) return null;

  // Data URI
  if (s.startsWith("data:")) return s;

  const apiBase = normalizeApiBase(API_BASE);

  // External URL
  if (/^https?:\/\//i.test(s)) {
    try {
      const parsed = new URL(s);

      // If it is our localhost backend URL,
      // extract ONLY the filename/path after /uploads/
      if (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1"
      ) {
        const marker = "/uploads/";
        const index = parsed.pathname.indexOf(marker);

        if (index !== -1) {
          const filename = parsed.pathname
            .substring(index + marker.length)
            .replace(/^\/+/, "")
            .replace(/^uploads\/+/i, "");

          return `${apiBase}/uploads/${filename}`;
        }

        return `${apiBase}${parsed.pathname}`;
      }

      return s;
    } catch {
      return null;
    }
  }

  // Remove ALL leading slashes
  s = s.replace(/^\/+/, "");

  // Remove repeated uploads/ prefixes
  s = s.replace(/^(uploads\/)+/i, "");

  // Now ALWAYS create exactly:
  // https://movie-ticket-booking-backend-llot.onrender.com/uploads/filename.png
  return `${apiBase}/uploads/${s}`;
}

// Utility to display duration (copied/adapted)
function displayDuration(item) {
  if (!item) return "";
  if (item.duration && typeof item.duration === "number") {
    const totalMins = item.duration;
    if (totalMins < 60) return `${totalMins}m`;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  }
  if (item.duration && typeof item.duration === "object") {
    const h = item.duration.hours ?? 0;
    const m = item.duration.minutes ?? 0;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  }
  return "";
}
function formatSlot(s) {
  try {
    const d = s.date ? new Date(s.date + "T00:00:00") : null;
    const dayName = d
      ? d.toLocaleDateString(undefined, { weekday: "short" })
      : "";
    const dateStr = d ? d.toLocaleDateString() : s.date || "";
    const time = s.time || "";
    const ampm = s.ampm || "";
    return `${dayName} ${dateStr} • ${time} ${ampm}`.trim();
  } catch (e) {
    return `${s.date || ""} ${s.time || ""} ${s.ampm || ""}`;
  }
}

// ---------- main page ----------
export default function ListMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchRef = useRef();
  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      fetchMovies();
    }, 300);
    return () => clearTimeout(searchRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, search]);

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMovies() {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filterType && filterType !== "all" && filterType !== "latestTrailers") {
        params.type = filterType;
      }
      if (filterType === "latestTrailers") params.latestTrailers = true;
      if (search && search.trim()) params.search = search.trim();

      const res = await axios.get(`${API_BASE}/api/movies`, { params });

      let items = [];
      if (res?.data?.success) {
        items = res.data.items || [];
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else {
        items = [];
      }

      const normalized = items.map(normalizeMovie);
      setMovies(normalized);
      console.log("movies (normalized):", normalized);
    } catch (err) {
      console.error("fetchMovies error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }

  function normalizeMovie(item) {
    const obj = { ...item };

    // Force-normalize top-level poster/thumbnail through getImageUrl (do NOT fallback to raw localhost)
    obj.poster = getImageUrl(item.poster) || null;
    obj.thumbnail = getImageUrl(item.thumbnail) || obj.poster || null;

    // Normalize people arrays
    const normalizeTopPeople = (arr = []) =>
      (arr || []).map((p) => {
        const fileOrPreview = p?.preview || p?.file || p?.image || p?.url || null;
        return {
          ...(p || {}),
          preview: getImageUrl(fileOrPreview) || null,
        };
      });

    obj.cast = normalizeTopPeople(item.cast);
    obj.directors = normalizeTopPeople(item.directors);
    obj.producers = normalizeTopPeople(item.producers);

    // latestTrailer branch
    if (
      item.latestTrailer &&
      (item.type === "latestTrailers" ||
        item.latestTrailer.title ||
        item.latestTrailer.thumbnail ||
        item.latestTrailer.videoId)
    ) {
      const lt = item.latestTrailer || {};
      obj.title = lt.title || item.title || item.movieName || null;
      obj.thumbnail = getImageUrl(lt.thumbnail) || obj.thumbnail || null;
      obj.trailerUrl = lt.videoId || item.trailerUrl || lt.trailerUrl || null;
      obj.genres = lt.genres || item.genres || [];
      obj.year = lt.year || item.year || null;
      obj.rating = lt.rating ?? item.rating ?? null;
      obj.duration = lt.duration || item.duration || null;
      obj.description = lt.description || item.description || item.story || null;

      const normalizeLatestPeople = (arr = []) =>
        (arr || []).map((p) => ({
          ...(p || {}),
          preview: getImageUrl(p?.file || p?.preview || p?.image) || null,
        }));

      obj.directors = normalizeLatestPeople(lt.directors || item.directors || []);
      obj.producers = normalizeLatestPeople(lt.producers || item.producers || []);
      obj.singers = normalizeLatestPeople(lt.singers || []);
    }

    obj.type = obj.type || (obj.title && !obj.movieName ? "latestTrailers" : "normal");
    obj.displayTitle = obj.movieName || obj.title || obj.movieName || "Untitled";

    return obj;
  }

  const types = useMemo(
    () => [
      { key: "all", label: "All", icon: Film },
      { key: "normal", label: "Normal", icon: Ticket },
      { key: "featured", label: "Featured", icon: Star },
      { key: "releaseSoon", label: "Coming Soon", icon: Calendar },
      { key: "latestTrailers", label: "Trailers", icon: PlayIcon },
    ],
    []
  );

  const filtered = useMemo(() => (movies || []).filter((item) => item.type !== "cinenews"), [movies]);

  async function handleDelete(id) {
    const item = movies.find((m) => m._id === id || m.id === id);
    if (!item) return;
    const title = item.movieName || item.title || "this item";
    const ok = window.confirm(`Delete "${title}"? This action cannot be undone.`);
    if (!ok) return;

    try {
      const targetId = item._id || item.id || id;
      await axios.delete(`${API_BASE}/api/movies/${targetId}`);
      setMovies((prev) => prev.filter((m) => (m._id || m.id) !== targetId));
      if (selected && (selected._1d || selected.id) === targetId) setSelected(null);
    } catch (err) {
      console.error("deleteMovie error:", err);
      alert("Failed to delete movie. See console for details.");
    }
  }

  return (
    <div className={styles5.listMoviesContainer}>
      <style>{customStyles}</style>
      <div className={styles5.maxWidth7xl}>
        <header className={styles5.listMoviesHeader}>
          <div className={styles5.listMoviesHeaderInner}>
            <div className="text-left">
              <h1 className={styles5.listMoviesTitle}>Movies</h1>
              <div className={styles5.listMoviesSubtitle}>{loading ? "Loading..." : `${filtered.length} items`}</div>
            </div>

            <div className={styles5.searchContainer}>
              <div className={styles5.searchBox}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search movies, stories, trailers..." className={styles5.searchInput} />
                <div className={styles5.searchIcon}>
                  <Search size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles5.filterContainer}>
            {types.map((t) => {
              const IconComponent = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setFilterType(t.key);
                  }}
                  className={`${styles5.filterButton} ${filterType === t.key ? styles5.filterButtonActive : styles5.filterButtonInactive}`}
                >
                  <IconComponent size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className={styles5.mainGrid}>
          <div className={styles5.leftColumn}>
            <div className={styles5.cardsGrid}>
              {error && (
                <div className={styles5.errorContainer}>
                  <div className={styles5.errorMessage}>Error</div>
                  <div className="text-sm mt-2">{error}</div>
                  <div className="mt-3">
                    <button onClick={fetchMovies} className={styles5.errorRetryButton}>
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {!error && filtered.length === 0 && !loading && (
                <div className={styles5.emptyState}>
                  <div className={styles5.emptyStateText}>No items found</div>
                  <div className={styles5.emptyStateSubtext}>Try adjusting your search or filters</div>
                </div>
              )}

              {filtered.map((item) => (
                <Card key={item._id || item.id || item.title || item.displayTitle} item={item} onOpen={() => setSelected(item)} onDelete={() => handleDelete(item._id || item.id)} />
              ))}

              {loading && (
                <div className={styles5.loadingState}>
                  <div className={styles5.loadingText}>Loading movies…</div>
                </div>
              )}
            </div>
          </div>

          <aside className={styles5.rightColumn}>
            <div className={styles5.detailSidebar}>
              <div className={styles5.detailHeader}>
                <h2 className={styles5.detailTitle}>Details</h2>
                <div className={styles5.detailLiveIndicator}>
                  <div className={styles5.detailLiveDot}></div>
                  <span className={styles5.detailLiveText}>Live</span>
                </div>
              </div>

              {selected ? <DetailView item={selected} onClose={() => setSelected(null)} /> : (
                <div className={styles5.detailEmptyState}>
                  <div className="flex items-center justify-center mb-3 w-full">
                    <div className={styles5.detailEmptyIcon}>
                      <Film size={60} className="text-red-600" />
                    </div>
                  </div>

                  <div className={styles5.detailEmptyText}>Click "View Details" on a card</div>
                  <div className={styles5.detailEmptySubtext}>Details will appear here after you click.</div>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Card and helpers ---------------- */

function Card({ item, onOpen, onDelete }) {
  const posterOrThumb =
  item.poster ||
  item.thumbnail ||
  item.image ||
  item.latestTrailer?.thumbnail ||
  PLACEHOLDER_POSTER;
  return (
    <div className={styles5.card} onClick={onOpen}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (typeof onDelete === "function") onDelete();
        }}
        title="Delete"
        aria-label={`Delete ${item.movieName || item.title}`}
        className={styles5.cardDeleteButton}
      >
        <X size={14} />
      </button>

      <div className="relative">
        <img
          src={posterOrThumb}
          alt={item.movieName || item.title || item.displayTitle}
          className={styles5.cardImage}
          onError={(e) => {
            console.warn("Image load failed:", e.currentTarget.src);
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_POSTER;
          }}
        />
      </div>

      <div className={styles5.cardContent}>
        <div className={styles5.cardHeader}>
          <div className="flex-1 min-w-0">
            <h3 className={styles5.cardTitle}>{item.movieName || item.title || item.displayTitle}</h3>
            <div className={styles5.cardCategories}>
              {(item.categories || item.genres || []).map((cat, index) => (
                <span key={index} className={styles5.cardCategory}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className={styles5.cardRatingContainer}>
            {item.type !== "releaseSoon" && (
              <>
                {item.rating && (
                  <div className={styles5.cardRating}>
                    <Star className={styles5.cardRatingIcon} size={14} fill="currentColor" />
                    <span className={styles5.cardRatingText}>{item.rating}</span>
                  </div>
                )}
                {item.duration && (
                  <div className={styles5.cardDuration}>
                    <Clock className={styles5.cardDurationIcon} size={14} />
                    <span className={styles5.cardDurationText}>{displayDuration(item)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <p className={styles5.cardDescription}>
          {(item.story || item.description || item.excerpt || "").slice(0, 150)}
          {(item.story || item.description || item.excerpt || "").length > 150 && "..."}
        </p>

        <div className={styles5.cardActions}>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className={styles5.cardViewButton}
            >
              <Play size={16} /> View Details
            </button>

            {item.trailerUrl && item.type !== "releaseSoon" && (
              <a href={item.trailerUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className={styles5.cardTrailerButton}>
                <PlayIcon className={styles5.cardTrailerIcon} /> Trailer
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonGrid({ list = [], roleLabel = "" }) {
  if (!list || list.length === 0) return null;
  return (
    <div className={styles5.personGrid}>
      <div className={styles5.personHeader}>
        <div className={styles5.personDot}></div>
        <div className={styles5.personTitle}>{roleLabel}</div>
      </div>
      <div className={styles5.personList}>
        {list.map((p, i) => {
          const src = getImageUrl(p.preview) || getImageUrl(p.file) || getImageUrl(p.image) || getImageUrl(p.url) || PLACEHOLDER_IMG_SM;
          return (
            <div key={i} className={styles5.personItem}>
              <div className="relative">
                <img
                  src={src}
                  alt={p.name || `${roleLabel}-${i}`}
                  className={styles5.personAvatar}
                  onError={(e) => {
                    console.warn("Avatar load failed:", e.currentTarget.src, p);
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACEHOLDER_IMG_SM;
                  }}
                />
              </div>
              <div className={styles5.personName}>{p.name || "-"}</div>
              {p.role && p.role !== roleLabel && <div className={styles5.personRole}>{p.role}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailView({ item, onClose }) {
  const getTypeGradient = (type) => {
    const gradients = {
      featured: "from-orange-500 to-red-600",
      normal: "from-blue-500 to-purple-600",
      releaseSoon: "from-green-500 to-emerald-600",
      latestTrailers: "from-pink-500 to-rose-600",
    };
    return gradients[type] || "from-gray-500 to-gray-600";
  };

  const posterSrc = getImageUrl(item.poster) || getImageUrl(item.thumbnail) || PLACEHOLDER_POSTER;

  return (
    <div className={styles5.detailContainer}>
      <div className={styles5.detailHeaderContainer}>
        <div className="flex-1">
          <div className={styles5.detailTypeIndicator}>
            <div className={`${styles5.detailTypeDot} bg-gradient-to-r ${getTypeGradient(item.type)}`}></div>
            <span className={styles5.detailTypeText}>
              {item.type === "featured" && "Featured Movie"}
              {item.type === "normal" && "Now Showing"}
              {item.type === "releaseSoon" && "Coming Soon"}
              {item.type === "latestTrailers" && "Latest Trailer"}
            </span>
          </div>
          <h2 className={styles5.detailContentTitle}>{item.movieName || item.title || item.displayTitle}</h2>
        </div>
        <button onClick={onClose} className={styles5.detailCloseButton}>
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {item.type === "latestTrailers" && (
          <>
            {item.thumbnail && (
              <div className={styles5.detailThumbnail}>
                <img src={getImageUrl(item.thumbnail) || PLACEHOLDER_POSTER} alt={item.title} className={styles5.detailThumbnailImage} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_POSTER; }} />
              </div>
            )}

            <div className={styles5.detailGrid}>
              {item.genres && item.genres.length > 0 && (
                <div className={styles5.detailGridItem}>
                  <div className={styles5.detailGridLabel}>Genres</div>
                  <div className={styles5.detailGridValue}>{(item.genres || []).join(", ")}</div>
                </div>
              )}
              {item.year && (
                <div className={styles5.detailGridItem}>
                  <div className={styles5.detailGridLabel}>Year</div>
                  <div className={styles5.detailGridValue}>{item.year}</div>
                </div>
              )}

              {item.duration && (
                <div className={styles5.detailGridItem}>
                  <div className={styles5.detailGridLabel}>Duration</div>
                  <div className={styles5.detailGridValue}>{displayDuration(item)}</div>
                </div>
              )}

              {item.rating && (
                <div className={styles5.detailGridItem}>
                  <div className={styles5.detailGridLabel}>Rating</div>
                  <div className={styles5.detailRatingValue}>
                    <Star size={16} fill="currentColor" />
                    {item.rating}/10
                  </div>
                </div>
              )}
            </div>

            <div className={styles5.detailDescription}>
              <div className={styles5.descriptionLabel}>Description</div>
              <div className={styles5.descriptionText}>{item.description}</div>
            </div>

            {item.trailerUrl && (
              <a href={item.trailerUrl} target="_blank" rel="noreferrer" className={styles5.watchTrailerButton}>
                <Play size={20} /> Watch Trailer Now
              </a>
            )}

            <PersonGrid list={item.directors} roleLabel="Directors" />
            <PersonGrid list={item.producers} roleLabel="Producers" />
            <PersonGrid list={item.singers} roleLabel="Singers" />
          </>
        )}

        {(item.type === "normal" || item.type === "featured") && (
          <>
            <div className="grid grid-cols-1 gap-6">
              <div className={styles5.detailThumbnail}>
                <img src={posterSrc} alt={item.movieName} className={styles5.detailPoster} onError={(e) => { console.warn("Poster failed:", e.currentTarget.src); e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_POSTER; }} />
              </div>

              <div className={styles5.detailInfoGrid}>
                <div className={styles5.detailInfoItem}>
                  <div className={styles5.detailInfoLabel}>Rating</div>
                  <div className={styles5.detailRatingValue}>
                    <Star size={18} fill="currentColor" />
                    {item.rating ?? "-"}
                    /10
                  </div>
                </div>

                <div className={styles5.detailInfoItem}>
                  <div className={styles5.detailInfoLabel}>Duration</div>
                  <div className={styles5.detailRatingValue}>
                    <Clock size={18} />
                    {displayDuration(item)}
                  </div>
                </div>

                <div className={styles5.detailInfoItem}>
                  <div className={styles5.detailInfoLabel}>Auditorium</div>
                  <div className={styles5.detailInfoValue}>{item.auditorium || item.seatPrices?.auditorium || "Audi 1"}</div>
                </div>

                {item.seatPrices && (
                  <>
                    <div className={styles5.detailInfoItem}>
                      <div className={styles5.detailInfoLabel}>Standard</div>
                      <div className={styles5.seatPrice}>₹{item.seatPrices.standard}</div>
                    </div>

                    <div className={styles5.detailInfoItem}>
                      <div className={styles5.detailInfoLabel}>Recliner</div>
                      <div className={styles5.seatPrice}>₹{item.seatPrices.recliner}</div>
                    </div>
                  </>
                )}
              </div>

              {item.trailerUrl && (
                <a href={item.trailerUrl} target="_blank" rel="noreferrer" className={`${styles5.cardTrailerButton} justify-center`}>
                  <Play size={18} /> Watch Official Trailer
                </a>
              )}
            </div>

            <div className={styles5.storySection}>
              <div className={styles5.storyLabel}>
                <div className={styles5.storyDot}></div>
                <div className={styles5.descriptionLabel}>Story</div>
              </div>
              <div className={styles5.storyText}>{item.story}</div>
            </div>

            {(item.slots || []).length > 0 && (
              <div className={styles5.showtimesSection}>
                <div className={styles5.showtimesHeader}>
                  <Calendar size={20} className={styles5.showtimesIcon} />
                  <div className={styles5.descriptionLabel}>Showtimes</div>
                </div>
                <div className={styles5.showtimesList}>
                  {(item.slots || []).map((s, i) => (
                    <div key={i} className={styles5.showtimeItem}>
                      <div className={styles5.showtimeText}>{formatSlot(s)}</div>
                      <div className={styles5.showtimeStatus}>
                        <div className={styles5.showtimeDot}></div>
                        <span className={styles5.showtimeStatusText}>AVAILABLE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PersonGrid list={item.cast} roleLabel="Cast" />
            <PersonGrid list={item.directors} roleLabel="Directors" />
            <PersonGrid list={item.producers} roleLabel="Producers" />
          </>
        )}

        {item.type === "releaseSoon" && (
          <div className={styles5.releaseSoonContainer}>
            <div className={styles5.releaseSoonImage}>
              <img src={getImageUrl(item.poster) || PLACEHOLDER_POSTER} alt={item.movieName} className={styles5.detailPoster} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_POSTER; }} />
            </div>
            <div className={styles5.releaseSoonText}>Coming Soon</div>
            <div className={styles5.releaseSoonCategories}>
              {(item.categories || []).map((cat, i) => <span key={i} className={styles5.releaseSoonCategory}>{cat}</span>)}
            </div>
            <div className={styles5.releaseSoonMessage}>Stay tuned for more updates!</div>
          </div>
        )}
      </div>
    </div>
  );
}
