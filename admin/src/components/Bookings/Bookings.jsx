// src/pages/Bookings.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { User, Film, Clock, Ticket, X } from "lucide-react";
import { styles2, fontStyles } from "../../assets/dummyStyles";

// helper: format date as: Tue, Oct 7, 2025 — 7:30 PM
const formatSlot = (date) => {
  if (!(date instanceof Date)) date = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const fmtINR = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : "₹0";

function getStoredToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    null
  );
}

// API base — change with Vite env var if needed
const API_BASE = "http://localhost:5000";

export default function Bookings() {
  const [selectedMovie, setSelectedMovie] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      setLoading(true);
      try {
        const token = getStoredToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Request only paid bookings by default
        const params = { paymentStatus: "paid", limit: 1000 };

        let res;
        // try user-specific route first (/api/bookings/my), otherwise fallback to /api/bookings
        try {
          res = await axios.get(`${API_BASE}/api/bookings/my`, {
            headers,
            params,
          });
        } catch (err) {
          res = await axios.get(`${API_BASE}/api/bookings`, {
            headers,
            params,
          });
        }

        const data = res?.data;
        let items = [];
        if (!data) items = [];
        else if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data.bookings)) items = data.bookings;
        else items = [];

        const mapped = items.map((b) => {
          const id = b._id || b.id || b.bookingId || "";
          const movie =
            (b.movie && (b.movie.title || b.movie.movieName)) ||
            b.movieName ||
            (typeof b.movie === "string" ? b.movie : "");
          const rawSlot = b.showtime || b.slot || b.time || b.date;
          const slot = rawSlot ? new Date(rawSlot) : null;
          const basePrice =
            Number(
              b.basePrice || b.base_price || (b.movie && b.movie.price) || 0
            ) || 0;
          let seats = [];
          if (Array.isArray(b.seats)) {
            seats = b.seats
              .map((s) =>
                typeof s === "string" ? s : (s && (s.seatId || s.id)) || ""
              )
              .filter(Boolean);
          } else if (Array.isArray(b.seatIds)) {
            seats = b.seatIds.map(String).filter(Boolean);
          }
          const customer =
            b.customer ||
            b.customerName ||
            (b.user && (b.user.name || b.user.fullName)) ||
            (b.raw && b.raw.customer) ||
            "";

          // server authoritative amount
          let amountRupees = 0;
          if (b.amountPaise !== undefined && b.amountPaise !== null)
            amountRupees = Number(b.amountPaise) / 100;
          else if (typeof b.amount === "number") amountRupees = b.amount;
          else if (
            b.raw &&
            b.raw.amountPaise !== undefined &&
            b.raw.amountPaise !== null
          )
            amountRupees = Number(b.raw.amountPaise) / 100;

          const status = (b.status || (b.raw && b.raw.status) || "")
            .toString()
            .toLowerCase();
          const paymentStatus = (
            b.paymentStatus ||
            (b.raw && b.raw.paymentStatus) ||
            ""
          )
            .toString()
            .toLowerCase();

          // NEW: auditorium extraction (defensive)
          let auditorium =
            b.auditorium ||
            b.audi ||
            b.audiName ||
            b.hall ||
            (b.raw && (b.raw.auditorium || b.raw.audi || b.raw.hall)) ||
            "";
          // normalize to string and fallback if empty
          auditorium = auditorium ? String(auditorium) : "";

          return {
            id,
            movie,
            slot,
            basePrice,
            seats,
            customer,
            raw: b,
            amount: amountRupees,
            status,
            paymentStatus,
            auditorium,
          };
        });

        // Defensive client-side filter: show only paid bookings (or status === 'paid')
        const paidOnly = mapped.filter(
          (m) => m.paymentStatus === "paid" || m.status === "paid"
        );

        if (!cancelled) setBookings(paidOnly);
      } catch (err) {
        console.error(
          "Failed to fetch bookings:",
          err?.response?.data || err.message || err
        );
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  // derive unique movie list for the select
  const movies = useMemo(() => {
    const set = new Set(bookings.map((b) => b.movie));
    return Array.from(set);
  }, [bookings]);

  // bookings to display (filter by selected movie if any)
  const bookingsToShow = useMemo(() => {
    const filtered = selectedMovie
      ? bookings.filter((b) => b.movie === selectedMovie)
      : bookings;
    return filtered;
  }, [selectedMovie, bookings]);

  const clearFilter = () => {
    setSelectedMovie("");
  };

  return (
    <div className={styles2.pageContainer} style={fontStyles.cinzelFont}>
      <div className={styles2.maxWidthContainer}>
        {/* header */}
        <header className={styles2.headerContainer}>
          {/* simple form: movie select */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className={styles2.formContainer}
          >
            <label className="sr-only" htmlFor="movie">
              Movie
            </label>
            <select
              id="movie"
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              className={styles2.select}
            >
              <option value="">All movies</option>
              {movies.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilter}
              title="Clear movie"
              className={styles2.clearButton}
            >
              <X className="w-4 h-4 inline-block" />
            </button>
          </form>
        </header>

        {/* grid */}
        <section className={styles2.gridContainer}>
          {loading && (
            <div className={styles2.messageContainer}>Loading bookings…</div>
          )}

          {!loading && bookingsToShow.length === 0 && (
            <div className={styles2.messageContainer}>No paid bookings.</div>
          )}

          {bookingsToShow.map((b) => {
            const amount = b.amount || 0;
            const audiDisplay =
              b.auditorium && b.auditorium.trim() ? b.auditorium : "Audi 1";
            return (
              <article key={b.id} className={styles2.bookingCard}>
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-3">
                      <div className={styles2.movieIconContainer}>
                        <Film className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={styles2.movieTitle}>{b.movie}</div>
                        <div className={styles2.bookingId}>
                          Booking ID:{" "}
                          <span className={styles2.bookingIdValue}>{b.id}</span>
                        </div>

                        <div className={styles2.bookedByLabel}>Booked by</div>
                        <div className={styles2.bookedByValue}>
                          {b.customer || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={styles2.seatsLabel}>Seats</div>
                      <div className={styles2.seatsValue}>{b.seats.length}</div>
                    </div>
                  </div>

                  <div className={styles2.detailContainer}>
                    <div className={styles2.detailItem}>
                      <Clock className={styles2.detailIcon} />
                      <div>
                        {b.slot ? formatSlot(b.slot) : "Time unavailable"}
                      </div>
                    </div>

                    {/* NEW: auditorium display */}
                    <div className={styles2.detailItem}>
                      <Ticket className={styles2.detailIcon} />
                      <div className="text-sm text-gray-300">
                        <span className={styles2.auditoriumLabel}>
                          Auditorium:
                        </span>
                        <span className={styles2.auditoriumValue}>
                          {audiDisplay}
                        </span>
                      </div>
                    </div>

                    <div className={styles2.detailItem}>
                      <Ticket className={styles2.detailIcon} />
                      <div>{b.seats.join(", ")}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className={styles2.amountLabel}>Amount</div>
                    <div className={styles2.amountValue}>{fmtINR(amount)}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
