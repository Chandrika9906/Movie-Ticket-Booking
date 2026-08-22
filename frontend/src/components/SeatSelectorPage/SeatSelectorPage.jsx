// src/components/SeatSelectorPage/SeatSelectorPage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
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

const getStoredToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken") ||
  null;

const normalizeSeatId = (s) => (s ? String(s).trim().toUpperCase() : "");
const sameMinute = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a),
    db = new Date(b);
  if (isNaN(da) || isNaN(db)) return false;
  da.setSeconds(0, 0);
  db.setSeconds(0, 0);
  return da.getTime() === db.getTime();
};

/* component */
export default function SeatSelectorPage() {
  const { id, slot } = useParams();
  const movieIdParam = id;
  const slotKey = slot ? decodeURIComponent(slot) : "";
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    const onStorage = () => setIsLoggedIn(Boolean(getStoredToken()));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* fetch movie */
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
          const item = data.item || data.data || (data.success ? data : null);
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

  /* slots resolution */
  const slotsSource = useMemo(() => {
    if (!movie) return [];
    if (Array.isArray(movie.slots) && movie.slots.length) return movie.slots;
    if (Array.isArray(movie.showtimes) && movie.showtimes.length)
      return movie.showtimes;
    return [];
  }, [movie]);

  const slotObj = useMemo(() => {
    if (!slotsSource.length || !slotKey) return null;
    const sString = slotsSource.find(
      (s) =>
        typeof s === "string" &&
        (s === slotKey || s === decodeURIComponent(slotKey))
    );
    if (sString) return { time: sString, audi: "Audi 1", _iso: sString };
    for (const s of slotsSource) {
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
        for (const s of slotsSource) {
          const iso = slotToISO(s);
          if (!iso) continue;
          const ts = new Date(iso).getTime();
          if (!isNaN(ts) && ts === providedTs) return { ...s, _iso: iso };
        }
      }
    } catch (e) {}
    return null;
  }, [slotsSource, slotKey]);

  // Resolve auditorium name from slot (slot-level), then movie (backend), then legacy fields, then fallback
  const audiName = useMemo(() => {
    // slot-level auditorium (preferred)
    if (slotObj && slotObj.auditorium && String(slotObj.auditorium).trim())
      return String(slotObj.auditorium).trim();
    // older alias 'audi' on slotObj
    if (slotObj && slotObj.audi && String(slotObj.audi).trim())
      return String(slotObj.audi).trim();
    // movie-level auditorium from backend
    if (movie && movie.auditorium && String(movie.auditorium).trim())
      return String(movie.auditorium).trim();
    // fallback to movie.audi or movie.hall etc (legacy)
    if (movie && movie.audi && String(movie.audi).trim())
      return String(movie.audi).trim();
    if (movie && movie.hall && String(movie.hall).trim())
      return String(movie.hall).trim();
    // default fallback
    return "Audi 1";
  }, [slotObj, movie]);

  /* validate showtime */
  useEffect(() => {
    if (!slotKey) {
      toast.error("Missing showtime. Select a time from the movie page.");
      if (movie) navigate(`/movies/${movie._id || movie.id || movieIdParam}`);
      else navigate("/movies");
      return;
    }
    const parsed = new Date(slotKey).getTime();
    if (isNaN(parsed) && !slotObj) {
      toast.error("Invalid showtime. Please select from the movie page.");
      if (movie) navigate(`/movies/${movie._id || movie.id || movieIdParam}`);
      else navigate("/movies");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotKey, slotObj, movie]);

  const mid = movie ? movie._id || movie.id || movieIdParam : movieIdParam;
  const storageKey = `bookings_${mid}_${slotKey}_${audiName}`;
  const legacyKey = `bookings_${mid}_${slotKey}`;

  /* occupancy polling & fetch */
  const pollRef = useRef(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setBookedAndPruneSelection = (setArr = []) => {
    const set = new Set(setArr);
    if (!mountedRef.current) return;
    setBooked((prev) => {
      const same = prev.size === set.size && [...prev].every((v) => set.has(v));
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

  const fetchOccupied = async (opts = { fallbackToLocal: true }) => {
    if (!mid || !slotKey) return;
    const showtimeQuery = slotObj && slotObj._iso ? slotObj._iso : slotKey;

    // primary: fetch bookings and filter PAID
    try {
      const res = await axios.get(`${API_BASE}/api/bookings`, {
        params: { movieId: mid },
        timeout: 8000,
      });
      const data = res?.data;
      let items = [];
      if (!data) items = [];
      else if (Array.isArray(data)) items = data;
      else if (Array.isArray(data.items)) items = data.items;
      else if (Array.isArray(data.bookings)) items = data.bookings;
      // collect paid seats for same-minute & same-audi
      const paidSeats = [];
      for (const b of items) {
        const bShow = b.showtime || b.slot || b.time || b.datetime || b.date;
        const bAudi =
          (b.audi || b.auditorium || b.audio || b.hall || "").toString() || "";
        if (!bShow) continue;
        if (!sameMinute(bShow, showtimeQuery)) continue;
        if (
          bAudi &&
          audiName &&
          bAudi.toString().toLowerCase() !== audiName.toString().toLowerCase()
        )
          continue;
        const ps = (b.paymentStatus || b.payment_status || "")
          .toString()
          .toLowerCase();
        if (ps !== "paid") continue;
        const sarr = Array.isArray(b.seats)
          ? b.seats.map((s) =>
              typeof s === "string" ? s : (s && (s.seatId || s.id)) || ""
            )
          : Array.isArray(b.seatIds)
          ? b.seatIds.map(String)
          : [];
        for (const s of sarr) {
          const n = normalizeSeatId(s);
          if (n) paidSeats.push(n);
        }
      }
      if (paidSeats.length > 0) {
        setBookedAndPruneSelection(paidSeats);
        return;
      }
      if (mountedRef.current) setBooked(new Set());
      try {
        localStorage.setItem(storageKey, JSON.stringify([]));
      } catch (e) {}
      return;
    } catch (err) {
      console.warn(
        "Primary paid-bookings fetch failed, falling back:",
        err?.message || err
      );
    }

    // fallback: occupied endpoint
    try {
      const token = getStoredToken();
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
        setBookedAndPruneSelection(normalized);
        return;
      }
      throw new Error("Invalid occupied response");
    } catch (err) {
      console.warn(
        "fetchOccupied fallback failed, using local storage:",
        err?.message || err
      );
      if (!opts.fallbackToLocal) return;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const arr = JSON.parse(raw);
          const normalized = Array.isArray(arr)
            ? arr.map((s) => normalizeSeatId(s)).filter(Boolean)
            : [];
          setBookedAndPruneSelection(normalized);
          return;
        }
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw) {
          const arrLegacy = JSON.parse(legacyRaw);
          const normalized = Array.isArray(arrLegacy)
            ? arrLegacy.map((s) => normalizeSeatId(s)).filter(Boolean)
            : [];
          setBookedAndPruneSelection(normalized);
          try {
            localStorage.setItem(storageKey, JSON.stringify([...normalized]));
          } catch (e) {}
          return;
        }
      } catch (e) {
        console.error("Fallback read failed:", e);
      }
      if (mountedRef.current) setBooked(new Set());
    }
  };

  useEffect(() => {
    if (!mid || !slotKey) return;
    fetchOccupied();
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    // Recreate poll whenever mid/slotKey/audiName/slotObj changes
    pollRef.current = setInterval(
      () => fetchOccupied({ fallbackToLocal: false }),
      8000
    );
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mid, slotKey, audiName, slotObj]);

  useEffect(() => {
    if (!loading && !movie) {
      toast.error("Movie not found.");
      navigate("/movies");
    }
  }, [loading, movie, navigate]);

  const toggleSeat = (idRaw) => {
    const id = normalizeSeatId(idRaw);
    if (!id) return;
    if (booked.has(id)) {
      toast.error(`Seat ${id} already booked`);
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());
  const basePrice = movie?.seatPrices?.standard ?? movie?.price ?? 0;

  const confirmBooking = async () => {
    if (selected.size === 0) {
      toast.error("Select at least one seat.");
      return;
    }
    const token = getStoredToken();
    if (!token) {
      toast.error(
        "You must be logged in to book seats. Redirecting to login..."
      );
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      setTimeout(() => navigate(`/login?next=${returnUrl}`), 700);
      return;
    }

    const seatsArr = [...selected].sort();
    const seatsPayload = seatsArr.map((sid) => {
      const row = String(sid).charAt(0).toUpperCase();
      const type = ["D", "E"].includes(row) ? "recliner" : "standard";
      const price =
        type === "recliner" ? Math.round(basePrice * 1.5) : basePrice;
      return { seatId: sid, type, price };
    });

    setBookingLoading(true);
    try {
      const payload = {
        movieId: movie?._id || movie?.id || movieIdParam,
        movieName: movie?.title || movie?.movieName || movie?.name || "",
        showtime: slotObj && slotObj._iso ? slotObj._iso : slotKey,
        audi: audiName,
        seats: seatsPayload,
        paymentMethod: "card",
        currency: "INR",
        email: "",
      };

      const res = await axios.post(`${API_BASE}/api/bookings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res?.data?.success && res?.data?.checkout?.url) {
        try {
          await fetchOccupied({ fallbackToLocal: false });
        } catch (e) {}
        window.location.href = res.data.checkout.url;
        return;
      }

      if (res?.data?.success) {
        await fetchOccupied({ fallbackToLocal: false });
        setSelected(new Set());
        toast.success("Booking created successfully.");
        return;
      }
      throw new Error(res?.data?.message || "Failed to create booking");
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        const returnUrl = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        setTimeout(() => navigate(`/login?next=${returnUrl}`), 700);
        return;
      }
      if (err?.response?.status === 409) {
        const occupied = (err.response.data?.occupied || []).map(
          normalizeSeatId
        );
        if (occupied.length) {
          setBooked((prev) => {
            const next = new Set(prev);
            occupied.forEach((s) => next.add(s));
            return next;
          });
          setSelected((prev) => {
            const next = new Set(prev);
            occupied.forEach((s) => next.delete(s));
            return next;
          });
          try {
            const arr = Array.from(booked);
            localStorage.setItem(
              storageKey,
              JSON.stringify([...arr, ...occupied])
            );
          } catch (e) {}
          toast.error(
            `Some seats were just booked by others: ${occupied.join(", ")}`
          );
        } else {
          toast.error(
            err.response.data?.message || "Some seats are already booked"
          );
        }
      } else {
        console.error("createBooking error:", err);
        toast.error(
          err?.response?.data?.message ||
            err.message ||
            "Failed to create booking"
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const total = [...selected].reduce((sum, s) => {
    const rowLetter = s[0];
    const def = ROWS.find((r) => r.id === rowLetter);
    const multiplier = def?.type === "recliner" ? 1.5 : 1;
    return sum + basePrice * multiplier;
  }, 0);
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
                ? new Date(
                    slotObj && slotObj._iso ? slotObj._iso : slotKey
                  ).toLocaleString("en-IN", {
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
            }}
          >
            <div className={seatSelectorHStyles.screenText}>CURVED SCREEN</div>
            <div className={seatSelectorHStyles.screenSubtext}>
              Please face the screen — enjoy the show
            </div>
          </div>
        </div>

        {/* Main */}
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

                        const priceTitle = `₹${
                          row.type === "recliner"
                            ? Math.round(basePrice * 1.5)
                            : basePrice
                        }`;
                        return (
                          <button
                            key={id}
                            onClick={() => toggleSeat(id)}
                            disabled={isBooked}
                            className={cls}
                            title={
                              isBooked
                                ? `Seat ${id} - Already Booked (paid)`
                                : `Seat ${id} (${row.type}) - ${priceTitle}`
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

          {/* Summary & Actions */}
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

                {selectedCount > 0 ? (
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
                          ₹{Math.round(total)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
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
                    disabled={bookingLoading || selectedCount === 0}
                    className={seatSelectorHStyles.confirmButton}
                  >
                    {bookingLoading ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>

                {!isLoggedIn && (
                  <div className="text-xs text-yellow-300 mt-2">
                    You must be logged in to complete booking.{" "}
                    <button
                      onClick={() =>
                        navigate(
                          `/login?next=${encodeURIComponent(
                            window.location.pathname + window.location.search
                          )}`
                        )
                      }
                      className="underline"
                    >
                      Login
                    </button>
                    .
                  </div>
                )}
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
                      ₹{basePrice}
                    </div>
                  </div>
                </div>
                <div className={seatSelectorHStyles.pricingItem}>
                  <div className={seatSelectorHStyles.pricingRow}>
                    <div className={seatSelectorHStyles.pricingLabel}>
                      Recliner
                    </div>
                    <div className={seatSelectorHStyles.pricingValueRecliner}>
                      ₹{Math.round(basePrice * 1.5)}
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
