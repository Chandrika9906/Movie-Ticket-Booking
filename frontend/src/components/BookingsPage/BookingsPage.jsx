// src/pages/BookingsPage.jsx
import React, { useEffect, useState } from "react";
import { Film, Clock, MapPin, QrCode, ChevronDown, X } from "lucide-react";
import QRCode from "qrcode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { bookingsPageStyles, formatTime, formatDuration } from "../../assets/dummyStyles";

// API base
const API_BASE = "http://localhost:5000";

/* ---------- small data-URI placeholder (offline-safe) ---------- */
function makePlaceholderDataUri(width = 320, height = 480, text = "No Image") {
  const fontSize = Math.max(10, Math.floor(Math.min(width, height) / 10));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><rect width='100%' height='100%' fill='#374151' /><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='${fontSize}' fill='#fff'>${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
const PLACEHOLDER_POSTER = makePlaceholderDataUri(320, 480, "No Image");

/* ---------- robust client-side normalization for image fields ---------- */
function normalizeApiBase(b) {
  return String(b || "").replace(/\/+$/, "");
}
function getImageUrl(maybe) {
  if (!maybe) return null;

  // Already an object, pick common props
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
  const s = maybe.trim();
  if (!s) return null;

  // data URI
  if (s.startsWith("data:")) return s;

  const apiBase = normalizeApiBase(API_BASE);

  // protocol-relative
  let toParse = s;
  if (toParse.startsWith("//")) toParse = "http:" + toParse;

  // If starts with `localhost:...` or `127.0.0.1:...` without scheme, add scheme
  if (/^(localhost|127\.0\.0\.1)(:|\/)/i.test(toParse)) {
    toParse = "http://" + toParse;
  }

  // Absolute http(s): if host is localhost or 127.* rewrite to API_BASE/uploads/<filename>
  if (/^https?:\/\//i.test(toParse)) {
    try {
      const parsed = new URL(toParse);
      const host = parsed.hostname.toLowerCase();
      if (host === "localhost" || host === "127.0.0.1") {
        const parts = parsed.pathname.split("/uploads/");
        const filename = parts.length > 1 ? parts.pop() : parsed.pathname.split("/").pop();
        if (filename) return `${apiBase}/uploads/${filename}`;
        return `${apiBase}${parsed.pathname}`;
      }
      // leave remote absolute urls intact (S3 etc.)
      return s;
    } catch (e) {
      // fall through
    }
  }

  // Leading slash -> absolute on API_BASE
  if (s.startsWith("/")) return `${apiBase}/${s.replace(/^\/+/, "")}`;

  // uploads/filename -> apiBase/uploads/filename
  if (s.startsWith("uploads/")) return `${apiBase}/${s}`;

  // hostname-like "localhost:5000/uploads/..." (no protocol)
  if (/^(localhost|127\.0\.0\.1)[:\/]/i.test(s)) {
    const parts = s.split("/uploads/");
    const filename = parts.length > 1 ? parts.pop() : s.split("/").pop();
    if (filename) return `${apiBase}/uploads/${filename}`;
  }

  // default treat as filename in uploads
  return `${apiBase}/uploads/${s.replace(/^uploads\//, "")}`;
}

/* ---------- helper to read stored token ---------- */
function getStoredToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    null
  );
}

/* ---------- main component ---------- */
export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [qrs, setQrs] = useState({});
  const [expanded, setExpanded] = useState({});
  const [scannedDetails, setScannedDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function computeTotals(booking) {
    if (booking.amountPaise !== undefined && booking.amountPaise !== null) {
      const amt = Number(booking.amountPaise) / 100;
      return { subtotal: amt, total: amt, seatCount: (booking.seats || []).length || 0 };
    }
    if (booking.raw && booking.raw.amountPaise !== undefined && booking.raw.amountPaise !== null) {
      const amt = Number(booking.raw.amountPaise) / 100;
      return { subtotal: amt, total: amt, seatCount: (booking.seats || []).length || 0 };
    }
    if (typeof booking.amount === "number" && booking.amount > 0) {
      return { subtotal: booking.amount, total: booking.amount, seatCount: (booking.seats || []).length || 0 };
    }
    if (booking.raw && typeof booking.raw.amount === "number" && booking.raw.amount > 0) {
      return { subtotal: booking.raw.amount, total: booking.raw.amount, seatCount: (booking.seats || []).length || 0 };
    }
    const seats = Array.isArray(booking.seats) ? booking.seats : [];
    const subtotal = seats.reduce((s, seat) => {
      if (!seat) return s;
      if (typeof seat === "object" && typeof seat.price === "number") return s + seat.price;
      return s;
    }, 0);
    return { subtotal, total: subtotal, seatCount: seats.length };
  }

  useEffect(() => {
    let mounted = true;
    async function fetchMyBookings() {
      setLoading(true);
      setError("");
      try {
        const token = getStoredToken();
        if (!token) {
          navigate("/login");
          return;
        }

        let res;
        try {
          res = await axios.get(`${API_BASE}/api/bookings/my`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          });
        } catch (err) {
          res = await axios.get(`${API_BASE}/api/bookings`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          });
        }

        const data = res?.data || {};
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data.bookings)) items = data.bookings;
        else if (Array.isArray(data.data)) items = data.data;
        else if (data.item && Array.isArray(data.item)) items = data.item;
        else if (data.items && Array.isArray(data.items)) items = data.items;
        else if (data && data._id) items = [data];

        const normalized = items.map((b) => {
          const id = b._id || b.id || b.bookingId || String(b.id || "");
          const movie = b.movie || {};
          const title = movie.title || movie.name || b.movieName || b.title || "Untitled";
          const rawPoster = movie.poster || b.poster || movie.image || "";
          const poster = getImageUrl(rawPoster) || ""; // <-- normalized here
          const category = movie.category || b.category || "";
          const durationMins = movie.durationMins ?? movie.duration ?? b.durationMins ?? 0;
          const slotTime = b.showtime || b.slotTime || b.slot || null;
          const auditorium = b.auditorium || b.audi || "Audi 1";

          const seats = Array.isArray(b.seats) && b.seats.length
            ? b.seats.map((s) => (typeof s === "string" ? { id: s } : { id: s.seatId || s.id || s.name || "", type: s.type, price: typeof s.price === "number" ? s.price : undefined }))
            : [];

          let amount = 0;
          if (b.amountPaise !== undefined && b.amountPaise !== null) {
            amount = Number(b.amountPaise) / 100;
          } else if (typeof b.amount === "number") {
            amount = b.amount;
          } else if (typeof b.total === "number") {
            amount = b.total;
          }

          return { id, title, poster, category, durationMins, slotTime, auditorium, seats, amount, amountPaise: b.amountPaise, raw: b };
        });

        if (mounted) setBookings(normalized);
      } catch (err) {
        console.error("Failed to load bookings:", err);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (mounted) setError(err?.response?.data?.message || err.message || "Failed to load bookings");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMyBookings();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    const makeQrs = async () => {
      const map = {};
      for (const b of bookings) {
        const seatsList = (b.seats || []).map((s) => (typeof s === "string" ? s : s.id || "")).filter(Boolean);
        const payload = JSON.stringify({
          bookingId: b.id,
          title: b.title,
          time: formatTime(b.slotTime),
          auditorium: b.auditorium,
          seats: seatsList,
        });
        try {
          const url = await QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 1, scale: 6 });
          map[b.id] = { url, payload };
        } catch (e) {
          console.error("QR error for", b.id, e);
          map[b.id] = { url: "", payload };
        }
      }
      if (mounted) setQrs(map);
    };
    if (bookings.length) makeQrs();
    return () => {
      mounted = false;
    };
  }, [bookings]);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleQrScan = (bookingId) => {
    const entry = qrs[bookingId];
    if (!entry || !entry.payload) return;
    try {
      const parsed = JSON.parse(entry.payload);
      setExpanded((prev) => ({ ...prev, [bookingId]: true }));
      const el = document.getElementById(`booking-card-${bookingId}`);
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setScannedDetails({ bookingId, ...parsed });
    } catch (e) {
      console.error("Failed to parse QR payload", e);
    }
  };
  const closeModal = () => setScannedDetails(null);

  return (
    <div className={bookingsPageStyles.pageContainer}>
      <div className={bookingsPageStyles.mainContainer}>
        <header className={bookingsPageStyles.header}>
          <h1 className={bookingsPageStyles.title}>Your Tickets</h1>
          <div className={bookingsPageStyles.subtitle}>Present QR at entry</div>
        </header>

        {loading && <div className={bookingsPageStyles.loading}>Loading bookings…</div>}
        {!loading && error && <div className={bookingsPageStyles.error}>{error}</div>}

        <div className={bookingsPageStyles.grid}>
          {bookings.length === 0 && !loading ? (
            <div className={bookingsPageStyles.noBookings}>No bookings found.</div>
          ) : (
            bookings.map((b) => {
              const totals = computeTotals(b);
              const isOpen = !!expanded[b.id];

              return (
                <article id={`booking-card-${b.id}`} key={b.id} className={bookingsPageStyles.bookingCard} aria-labelledby={`booking-${b.id}-title`}>
                  <div className={bookingsPageStyles.cardContent}>
                    <div className={bookingsPageStyles.posterContainer}>
                      <img
                        src={b.poster || PLACEHOLDER_POSTER}
                        alt={b.title}
                        className={bookingsPageStyles.poster}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_POSTER;
                        }}
                      />
                    </div>

                    <div className={bookingsPageStyles.cardInfo}>
                      <div className={bookingsPageStyles.cardHeader}>
                        <div>
                          <h2 id={`booking-${b.id}-title`} className={bookingsPageStyles.movieTitle}>
                            <Film className={bookingsPageStyles.movieIcon} />
                            <span>{b.title}</span>
                          </h2>

                          <div className={bookingsPageStyles.bookingId}>
                            Booking ID:{" "}
                            <span className={bookingsPageStyles.bookingIdText}>{b.id}</span>
                          </div>
                        </div>

                        <div className={bookingsPageStyles.category}>
                          <div className="hidden lg:block">{b.category}</div>
                        </div>
                      </div>

                      <div className={bookingsPageStyles.details}>
                        <div className={bookingsPageStyles.timeContainer}>
                          <Clock className={bookingsPageStyles.timeIcon} />
                          <div>{formatTime(b.slotTime)}</div>
                        </div>

                        <div className={bookingsPageStyles.locationContainer}>
                          <MapPin className={bookingsPageStyles.locationIcon} />
                          <div className={bookingsPageStyles.locationText}>{b.auditorium}</div>
                        </div>
                      </div>

                      <div className={bookingsPageStyles.durationLabel}>Duration</div>
                      <div className={bookingsPageStyles.duration}>{formatDuration(b.durationMins)}</div>
                    </div>
                  </div>

                  <div className={bookingsPageStyles.summary}>
                    <div className={bookingsPageStyles.seatsLabel}>Seats ({totals.seatCount})</div>
                    <div className={bookingsPageStyles.total}>₹{totals.total.toLocaleString("en-IN")}</div>
                  </div>

                  <div className={`${bookingsPageStyles.expandedDetails} ${isOpen ? bookingsPageStyles.expandedOpen : bookingsPageStyles.expandedClosed}`} aria-hidden={!isOpen}>
                    <div className={bookingsPageStyles.seatsSection}>
                      <div className={bookingsPageStyles.seatsLabelExpanded}>Seats ({totals.seatCount})</div>
                      <div className={bookingsPageStyles.seatsContainer}>
                        {(b.seats || []).map((s) => (
                          <div key={s.id || s} className={bookingsPageStyles.seatItem}>
                            <div className={bookingsPageStyles.seatId}>{s.id || s}</div>
                            <div className={`${bookingsPageStyles.seatType} ${s.type === "recliner" ? bookingsPageStyles.seatTypeRecliner : bookingsPageStyles.seatTypeStandard}`}>
                              {s.type === "recliner" ? "Recliner" : "Standard"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={bookingsPageStyles.pricing}>
                      <div className={bookingsPageStyles.subtotal}>
                        <div>Seats subtotal</div>
                        <div>₹{totals.subtotal.toLocaleString("en-IN")}</div>
                      </div>

                      <div className={bookingsPageStyles.finalTotal}>
                        <div>Total</div>
                        <div>₹{totals.total.toLocaleString("en-IN")}</div>
                      </div>
                    </div>

                    <div className={bookingsPageStyles.qrSection}>
                      <div className={bookingsPageStyles.qrLabel}>
                        <QrCode className={bookingsPageStyles.qrIcon} />
                        <div>Ticket QR</div>
                      </div>
                      <div className="ml-auto">
                        {qrs[b.id] && qrs[b.id].url ? (
                          <img src={qrs[b.id].url} alt={`${b.title} qr`} className={bookingsPageStyles.qrImage} role="button" tabIndex={0} onClick={() => handleQrScan(b.id)} onKeyDown={(e) => { if (e.key === "Enter") handleQrScan(b.id); }} />
                        ) : (
                          <div className={bookingsPageStyles.qrUnavailable}>QR unavailable</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={bookingsPageStyles.toggleButton}>
                    <button onClick={() => toggle(b.id)} aria-expanded={isOpen} className={bookingsPageStyles.detailsButton}>
                      <span>{isOpen ? "Hide details" : "View details"}</span>
                      <ChevronDown className={`${bookingsPageStyles.chevron} ${isOpen ? bookingsPageStyles.chevronOpen : bookingsPageStyles.chevronClosed}`} />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {scannedDetails && (
        <div className={bookingsPageStyles.modalOverlay} aria-modal="true" role="dialog">
          <div className={bookingsPageStyles.modalBackdrop} onClick={closeModal} aria-hidden="true" />
          <div className={bookingsPageStyles.modalContent}>
            <div className={bookingsPageStyles.modalHeader}>
              <div>
                <h3 className={bookingsPageStyles.modalTitle}>{scannedDetails.title}</h3>
                <div className={bookingsPageStyles.modalBookingId}>
                  Booking ID: <span className={bookingsPageStyles.modalIdText}>{scannedDetails.bookingId}</span>
                </div>
                <div className={bookingsPageStyles.modalDetails}>
                  <div><strong>Time:</strong> {scannedDetails.time}</div>
                  <div><strong>Auditorium:</strong> {scannedDetails.auditorium}</div>
                  <div className="mt-2"><strong>Seats:</strong> {Array.isArray(scannedDetails.seats) ? scannedDetails.seats.join(", ") : scannedDetails.seats}</div>
                </div>
              </div>

              <button onClick={closeModal} className={bookingsPageStyles.modalCloseButton} aria-label="Close scanned details">
                <X className={bookingsPageStyles.modalCloseIcon} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
