// src/components/SeatSelectorPage/SeatSelectorPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Sofa,
  RockingChair,
  Ticket,
  CreditCard,
  Film,
} from "lucide-react";
import { toast } from "react-toastify";
import { seatSelectorHStyles } from "../../assets/dummyStyles";

const API_BASE = "http://localhost:5000";

/* layout */
const ROWS = [
  { id: "A", type: "standard", count: 8 },
  { id: "B", type: "standard", count: 8 },
  { id: "C", type: "standard", count: 8 },
  { id: "D", type: "recliner", count: 8 },
  { id: "E", type: "recliner", count: 8 },
];
const seatId = (r, n) => `${r}${n}`;

/* helpers */
const to24Hour = (timeStr = "00:00", ampm = "") => {
  const [hRaw = "0", mRaw = "00"] = String(timeStr).split(":");
  let h = Number(hRaw || 0);
  const m = String(Number(mRaw) || 0).padStart(2, "0");
  const a = (ampm || "").toUpperCase();
  if (a === "AM" && h === 12) h = 0;
  if (a === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${m}`;
};

const slotToISO = (slot) => {
  if (!slot) return null;
  if (typeof slot === "string") return slot;
  if (typeof slot === "object") {
    if (slot.date && (slot.time || slot.datetime || slot.iso)) {
      const hhmm = to24Hour(
        slot.time || slot.datetime || slot.iso || "00:00",
        slot.ampm || slot.amp || ""
      );
      return `${slot.date}T${hhmm}:00+05:30`;
    }
    if (slot.datetime) return slot.datetime;
    if (slot.time && typeof slot.time === "string") return slot.time;
  }
  return null;
};

const getAuthToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("jwt") ||
  null;

const normalizeSeatId = (s) => (s ? String(s).trim().toUpperCase() : "");
const sameMinute = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a),
    db = new Date(b);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return false;
  da.setSeconds(0, 0);
  db.setSeconds(0, 0);
  return da.getTime() === db.getTime();
};

export default function SeatSelectorPage() {
  const { id, slot } = useParams();
  const movieIdParam = id;
  const slotKey = slot ? decodeURIComponent(slot) : "";
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAuthToken())
  );
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getAuthToken()));
  }, []);
  useEffect(() => {
    const onStorage = (e) => {
      if (
        ["token", "authToken", "accessToken", "jwt"].includes(e.key) ||
        e.key === null
      ) {
        setIsAuthenticated(Boolean(getAuthToken()));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // fetch movie
  useEffect(() => {
    let mounted = true;
    const fetchMovie = async () => {
      setLoading(true);
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
          const item =
            data.item ||
            data.data ||
            (data.success && data.movie) ||
            (data.success ? data : null);
          setMovie(item || null);
        }
      } catch (err) {
        console.error("Failed to fetch movie:", err);
        toast.error("Failed to fetch movie from server");
        setMovie(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (movieIdParam) fetchMovie();
    else {
      setLoading(false);
      setMovie(null);
    }
    return () => {
      mounted = false;
    };
  }, [movieIdParam]);

  // resolve slot object
  const slotObj = useMemo(() => {
    if (!movie || !slotKey) return null;
    const slots = Array.isArray(movie.slots)
      ? movie.slots
      : Array.isArray(movie.showtimes)
      ? movie.showtimes
      : [];
    if (!slots.length) return null;

    const sString = slots.find(
      (s) =>
        typeof s === "string" &&
        (s === slotKey || s === decodeURIComponent(slotKey))
    );
    if (sString) return { time: sString, audi: "Audi 1", _iso: sString };

    for (const s of slots) {
      if (!s) continue;
      if (typeof s === "object") {
        const iso = slotToISO(s);
        if (!iso) continue;
        if (iso === slotKey || iso === decodeURIComponent(slotKey))
          return { ...s, _iso: iso };
      }
    }
    try {
      const providedTs = new Date(slotKey).getTime();
      if (!isNaN(providedTs)) {
        for (const s of slots) {
          const iso = slotToISO(s);
          if (!iso) continue;
          const ts = new Date(iso).getTime();
          if (!isNaN(ts) && ts === providedTs) return { ...s, _iso: iso };
        }
      }
    } catch (e) {}
    return null;
  }, [movie, slotKey]);

  // Resolve auditorium name: slot-level (auditorium / audi) -> movie-level (auditorium / audi / hall) -> fallback
  const audiName = useMemo(() => {
    if (slotObj && slotObj.auditorium && String(slotObj.auditorium).trim())
      return String(slotObj.auditorium).trim();
    if (slotObj && slotObj.audi && String(slotObj.audi).trim())
      return String(slotObj.audi).trim();
    if (movie && movie.auditorium && String(movie.auditorium).trim())
      return String(movie.auditorium).trim();
    if (movie && movie.audi && String(movie.audi).trim())
      return String(movie.audi).trim();
    if (movie && movie.hall && String(movie.hall).trim())
      return String(movie.hall).trim();
    return "Audi 1";
  }, [slotObj, movie]);

  // validate showtime
  useEffect(() => {
    if (!slotKey) {
      toast.error("Missing showtime. Select a time from the movie page.");
      navigate(
        movie ? `/movies/${movie._id || movie.id || movieIdParam}` : "/movies"
      );
      return;
    }
    const isValidDate = !!slotKey && !isNaN(new Date(slotKey).getTime());
    if (!isValidDate && !slotObj) {
      toast.error(
        "Invalid or missing showtime. Please select a time from the movie page."
      );
      navigate(
        movie ? `/movies/${movie._id || movie.id || movieIdParam}` : "/movies"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotKey, movie, slotObj]);

  const mid = movie ? movie._id || movie.id || movieIdParam : movieIdParam;
  const storageKey = `bookings_${mid}_${slotKey}_${audiName}`;
  const legacyKey = `bookings_${mid}_${slotKey}`;

  // fetch booked seats (paid only) with fallback to occupied endpoint and localStorage
  useEffect(() => {
    let cancelled = false;

    const setBookedAndPrune = (arr) => {
      const set = new Set(arr);
      if (cancelled) return;
      setBooked((prev) => {
        const same =
          prev.size === set.size && [...prev].every((v) => set.has(v));
        if (same) return prev;
        setSelected((selPrev) => {
          const nextSel = new Set(selPrev);
          for (const s of set) nextSel.delete(s);
          return nextSel;
        });
        return set;
      });
      try {
        localStorage.setItem(storageKey, JSON.stringify([...set]));
      } catch (e) {}
    };

    const fetchBooked = async () => {
      if (!movieIdParam || !slotKey) return;
      const showtimeQuery = slotObj && slotObj._iso ? slotObj._iso : slotKey;

      // primary: /api/bookings -> filter paid bookings
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE}/api/bookings`, {
          params: { movieId: movieIdParam, limit: 1000 },
          headers,
          timeout: 8000,
        });
        const data = res?.data;
        let items = [];
        if (!data) items = [];
        else if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data.bookings)) items = data.bookings;
        else items = [];

        const paidSeats = [];
        for (const b of items) {
          const bShowRaw =
            b.showtime || b.slot || b.time || b.showtimeIso || b._iso || null;
          if (!bShowRaw) continue;
          if (!sameMinute(bShowRaw, showtimeQuery)) continue;
          const bAudi = (b.auditorium || b.audi || b.audiName || "").toString();
          if (
            bAudi &&
            audiName &&
            bAudi.toLowerCase() !== audiName.toLowerCase()
          )
            continue;
          const ps = (b.paymentStatus || b.payment_status || "")
            .toString()
            .toLowerCase();
          if (ps !== "paid") continue;
          const sarr = Array.isArray(b.seats)
            ? b.seats
                .map((s) =>
                  typeof s === "string" ? s : (s && (s.seatId || s.id)) || ""
                )
                .filter(Boolean)
            : Array.isArray(b.seatIds)
            ? b.seatIds.map(String).filter(Boolean)
            : [];
          for (const s of sarr) paidSeats.push(normalizeSeatId(s));
        }

        if (!cancelled) {
          if (paidSeats.length > 0) {
            setBookedAndPrune(paidSeats);
          } else {
            setBooked(new Set());
            try {
              localStorage.setItem(storageKey, JSON.stringify([]));
            } catch (e) {}
          }
        }
        return;
      } catch (err) {
        console.warn(
          "Primary paid-bookings fetch failed, falling back:",
          err?.message || err
        );
      }

      // fallback: /api/bookings/occupied
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res2 = await axios.get(`${API_BASE}/api/bookings/occupied`, {
          params: { movieId: mid, showtime: showtimeQuery, audi: audiName },
          headers,
          timeout: 8000,
        });
        const data2 = res2?.data;
        if (data2 && Array.isArray(data2.occupied)) {
          const normalized = data2.occupied
            .map((s) => normalizeSeatId(s))
            .filter(Boolean);
          if (!cancelled) setBookedAndPrune(normalized);
          return;
        }
        throw new Error("Invalid occupied response");
      } catch (err) {
        console.warn(
          "fetchBooked fallback failed, using local storage:",
          err?.message || err
        );
        if (cancelled) return;
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const arr = JSON.parse(raw);
            const normalized = Array.isArray(arr)
              ? arr.map(normalizeSeatId).filter(Boolean)
              : [];
            setBooked(new Set(normalized));
            return;
          }
          const legacyRaw = localStorage.getItem(legacyKey);
          if (legacyRaw) {
            const arrLegacy = JSON.parse(legacyRaw);
            const s = new Set(
              Array.isArray(arrLegacy) ? arrLegacy.map(normalizeSeatId) : []
            );
            setBooked(s);
            try {
              localStorage.setItem(storageKey, JSON.stringify([...s]));
            } catch (e) {}
            return;
          }
        } catch (e) {
          console.error("Fallback read failed:", e);
        }
        setBooked(new Set());
      }
    };

    fetchBooked();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieIdParam, slotKey, audiName, slotObj]);

  useEffect(() => {
    if (!loading && !movie) {
      toast.error("Movie not found.");
      navigate("/movies");
    }
  }, [loading, movie, navigate]);

  const toggleSeat = (id) => {
    const nid = normalizeSeatId(id);
    if (booked.has(nid)) {
      toast.error(`Seat ${nid} already booked`);
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(nid) ? next.delete(nid) : next.add(nid);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  // pricing - use paise to avoid floating rounding issues
  const basePriceRupee =
    Number(movie?.seatPrices?.standard ?? movie?.price ?? 0) || 0;
  const standardPaise = Math.round(basePriceRupee * 100);
  const reclinerRupee =
    typeof movie?.seatPrices?.recliner !== "undefined" &&
    movie?.seatPrices?.recliner !== null
      ? Number(movie.seatPrices.recliner)
      : null;
  const reclinerPaise =
    reclinerRupee !== null
      ? Math.round(reclinerRupee * 100)
      : Math.round(standardPaise * 1.5);

  const confirmBooking = async () => {
    if (selected.size === 0) {
      toast.error("Select at least one seat.");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      toast.error("You must be logged in to book seats.");
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      setTimeout(() => navigate(`/login?redirect=${returnUrl}`), 400);
      return;
    }

    const seatsArr = [...selected].sort();
    setBookingLoading(true);
    try {
      const payload = {
        movieId: movie?._id || movie?.id || movieIdParam,
        movieName: movie?.title || movie?.movieName || movie?.name || "",
        showtime: slotKey,
        auditorium: audiName,
        seats: seatsArr,
        paymentMethod: "card",
        currency: "INR",
        email: "",
      };

      const res = await axios.post(`${API_BASE}/api/bookings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res?.data;
      if (data && data.success) {
        // redirect to checkout if provided
        if (data.checkout?.url) {
          const newBooked = new Set([
            ...booked,
            ...seatsArr.map(normalizeSeatId),
          ]);
          try {
            localStorage.setItem(storageKey, JSON.stringify([...newBooked]));
          } catch (e) {}
          window.location.href = data.checkout.url;
          return;
        }
        // otherwise mark as booked locally and clear selection
        const newBooked = new Set([
          ...booked,
          ...seatsArr.map(normalizeSeatId),
        ]);
        setBooked(newBooked);
        setSelected(new Set());
        try {
          localStorage.setItem(storageKey, JSON.stringify([...newBooked]));
        } catch (e) {}
        toast.success(
          `${seatsArr.length} seat(s) reserved — proceed to payment`
        );
        return;
      }
      toast.error(
        (data && data.message) || "Failed to create booking on server"
      );
    } catch (err) {
      console.error(
        "confirmBooking error:",
        err?.response?.data || err.message || err
      );
      if (err?.response?.status === 401) {
        toast.error("Session expired — please log in again.");
        ["token", "authToken", "accessToken", "jwt"].forEach((k) =>
          localStorage.removeItem(k)
        );
        setIsAuthenticated(false);
        const returnUrl = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        setTimeout(() => navigate(`/login?redirect=${returnUrl}`), 400);
        return;
      }
      if (err?.response?.status === 409) {
        const occupied = err.response.data?.occupied || [];
        if (occupied.length > 0) {
          setBooked((prev) => {
            const next = new Set(prev);
            occupied.forEach((s) => next.add(normalizeSeatId(s)));
            try {
              localStorage.setItem(storageKey, JSON.stringify([...next]));
            } catch (e) {}
            return next;
          });
          setSelected((prev) => {
            const next = new Set(prev);
            occupied.forEach((s) => next.delete(normalizeSeatId(s)));
            return next;
          });
          toast.error(
            `Some seats were just booked by others: ${occupied.join(", ")}`
          );
        } else {
          toast.error(
            err.response.data?.message || "Some seats are already booked"
          );
        }
        return;
      }
      toast.error(err?.response?.data?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const totalPaise = [...selected].reduce((sum, s) => {
    const rowLetter = s[0];
    const def = ROWS.find((r) => r.id === rowLetter);
    const seatPaise = def?.type === "recliner" ? reclinerPaise : standardPaise;
    return sum + (seatPaise || 0);
  }, 0);
  const total = (totalPaise / 100).toFixed(2);
  const selectedCount = selected.size;

  return (
    <div className={seatSelectorHStyles.pageContainer}>
      <style>{seatSelectorHStyles.customCSS}</style>
      <div className={seatSelectorHStyles.mainContainer}>
        {/* Header */}
        <div
          className={seatSelectorHStyles.headerContainer}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              className={seatSelectorHStyles.backButton}
            >
              <ArrowLeft size={18} /> Back
            </button>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <h1
              className={seatSelectorHStyles.movieTitle}
              style={{
                fontFamily: "'Cinzel', 'Times New Roman', serif",
                textShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
                letterSpacing: "0.06em",
                margin: 0,
              }}
            >
              {movie?.title || movie?.movieName || "Loading..."}
            </h1>
            <div
              className={seatSelectorHStyles.showtimeText}
              style={{ marginTop: 6 }}
            >
              {slotKey
                ? new Date(slotKey).toLocaleString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Showtime unavailable"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              minWidth: 120,
            }}
          >
            <div
              className={seatSelectorHStyles.audiBadge}
              style={{
                background: "linear-gradient(90deg,#111,#222)",
                color: "red",
                padding: "6px 12px",
                borderRadius: 10,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
              }}
            >
              <Film size={14} />
              <span>{audiName}</span>
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className={seatSelectorHStyles.screenContainer}>
          <div
            className={seatSelectorHStyles.screen}
            style={{
              transform: "perspective(120px) rotateX(6deg)",
              maxWidth: 900,
              boxShadow: "0 0 40px rgba(220, 38, 38, 0.18)",
            }}
          >
            <div className={seatSelectorHStyles.screenText}>CURVED SCREEN</div>
            <div className={seatSelectorHStyles.screenSubtext}>
              Please face the screen — enjoy the show
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={seatSelectorHStyles.mainContent}>
          <div className={seatSelectorHStyles.sectionHeader}>
            <div className={seatSelectorHStyles.sectionTitleContainer}>
              <h2
                className={seatSelectorHStyles.sectionTitle}
                style={{
                  fontFamily: "'Cinzel', 'Times New Roman', serif",
                  textShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
                  letterSpacing: "0.06em",
                }}
              >
                Select Your Seats
              </h2>
              <div className={seatSelectorHStyles.titleDivider} />
            </div>
          </div>

          {/* Seat grid */}
          <div className={seatSelectorHStyles.seatGridContainer}>
            {ROWS.map((row) => (
              <div key={row.id} className={seatSelectorHStyles.rowContainer}>
                <div className={seatSelectorHStyles.rowHeader}>
                  <div className={seatSelectorHStyles.rowLabel}>{row.id}</div>
                  <div className="flex-1 flex justify-center">
                    <div
                      className={seatSelectorHStyles.seatGrid}
                      style={{ width: "100%", maxWidth: "720px" }}
                    >
                      {Array.from({ length: row.count }).map((_, i) => {
                        const num = i + 1;
                        const id = seatId(row.id, num);
                        const normalizedId = normalizeSeatId(id);
                        const isBooked = booked.has(normalizedId);
                        const isSelected = selected.has(normalizedId);

                        let cls = seatSelectorHStyles.seatButton;
                        if (isBooked)
                          cls += ` ${seatSelectorHStyles.seatButtonBooked}`;
                        else if (isSelected)
                          cls +=
                            row.type === "recliner"
                              ? ` ${seatSelectorHStyles.seatButtonSelectedRecliner}`
                              : ` ${seatSelectorHStyles.seatButtonSelectedStandard}`;
                        else
                          cls +=
                            row.type === "recliner"
                              ? ` ${seatSelectorHStyles.seatButtonAvailableRecliner}`
                              : ` ${seatSelectorHStyles.seatButtonAvailableStandard}`;

                        const perSeatPaise =
                          row.type === "recliner"
                            ? reclinerPaise
                            : standardPaise;
                        const perSeatRupeeDisplay = (
                          (perSeatPaise || 0) / 100
                        ).toFixed(2);

                        return (
                          <button
                            key={id}
                            onClick={() => toggleSeat(id)}
                            disabled={isBooked}
                            className={cls}
                            title={
                              isBooked
                                ? `Seat ${id} - Already Booked (paid)`
                                : `Seat ${id} (${row.type}) - ₹${perSeatRupeeDisplay}`
                            }
                            aria-pressed={isSelected}
                          >
                            <div className={seatSelectorHStyles.seatContent}>
                              {row.type === "recliner" ? (
                                <Sofa
                                  size={16}
                                  className={seatSelectorHStyles.seatIcon}
                                />
                              ) : (
                                <RockingChair
                                  size={12}
                                  className={seatSelectorHStyles.seatIcon}
                                />
                              )}
                              <div className={seatSelectorHStyles.seatNumber}>
                                {num}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className={seatSelectorHStyles.rowType}>{row.type}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Summary & Actions */}
          <div className={seatSelectorHStyles.summaryGrid}>
            <div className={seatSelectorHStyles.summaryContainer}>
              <h3 className={seatSelectorHStyles.summaryTitle}>
                <Ticket size={18} /> Booking Summary
              </h3>

              <div className="space-y-4">
                <div className={seatSelectorHStyles.summaryItem}>
                  <span className={seatSelectorHStyles.summaryLabel}>
                    Selected Seats:
                  </span>
                  <span className={seatSelectorHStyles.summaryValue}>
                    {selectedCount}
                  </span>
                </div>

                {selectedCount > 0 && (
                  <>
                    <div className={seatSelectorHStyles.selectedSeatsContainer}>
                      <div className={seatSelectorHStyles.selectedSeatsLabel}>
                        Selected Seats:
                      </div>
                      <div className={seatSelectorHStyles.selectedSeatsList}>
                        {[...selected].sort().map((s) => (
                          <span
                            key={s}
                            className={seatSelectorHStyles.selectedSeatBadge}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={seatSelectorHStyles.totalContainer}>
                      <div className={seatSelectorHStyles.pricingRow}>
                        <span className={seatSelectorHStyles.totalLabel}>
                          Total Amount:
                        </span>
                        <span className={seatSelectorHStyles.totalValue}>
                          ₹{total}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {selectedCount === 0 && (
                  <div className={seatSelectorHStyles.emptyState}>
                    <div className={seatSelectorHStyles.emptyStateTitle}>
                      No seats selected
                    </div>
                    <div className={seatSelectorHStyles.emptyStateSubtitle}>
                      Select seats from the grid to continue
                    </div>
                  </div>
                )}

                <div className={seatSelectorHStyles.actionButtons}>
                  <button
                    onClick={clearSelection}
                    disabled={selectedCount === 0 || bookingLoading}
                    className={seatSelectorHStyles.clearButton}
                  >
                    Clear
                  </button>
                  <button
                    onClick={confirmBooking}
                    disabled={selectedCount === 0 || bookingLoading}
                    className={seatSelectorHStyles.confirmButton}
                  >
                    {bookingLoading
                      ? "Booking..."
                      : isAuthenticated
                      ? "Confirm Booking"
                      : "Log in to Book"}
                  </button>
                </div>
              </div>
            </div>

            <div className={seatSelectorHStyles.pricingContainer}>
              <h3 className={seatSelectorHStyles.pricingTitle}>
                <CreditCard size={18} /> Pricing Info
              </h3>
              <div className="space-y-3">
                <div className={seatSelectorHStyles.pricingItem}>
                  <div className={seatSelectorHStyles.pricingRow}>
                    <div className={seatSelectorHStyles.pricingLabel}>
                      Standard
                    </div>
                    <div className={seatSelectorHStyles.pricingValueStandard}>
                      ₹{(standardPaise / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className={seatSelectorHStyles.pricingItem}>
                  <div className={seatSelectorHStyles.pricingRow}>
                    <div className={seatSelectorHStyles.pricingLabel}>
                      Recliner
                    </div>
                    <div className={seatSelectorHStyles.pricingValueRecliner}>
                      ₹{(reclinerPaise / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className={seatSelectorHStyles.pricingNote}>
                  All prices include taxes. No hidden charges.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
