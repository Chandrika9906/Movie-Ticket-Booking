import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { styles3, fontStyles2 } from "../../assets/dummyStyles";

// format INR
const fmtINR = (num) =>
  typeof num === "number"
    ? `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : "₹0";

// API base — change with Vite env var if needed
const API_BASE = import.meta.env.VITE_API_BASE || "https://movie-ticket-booking-backend-llot.onrender.com";

const REQUEST_TIMEOUT_MS = 30000; // generous timeout to survive Render cold starts
const RETRY_DELAY_MS = 4000;
const MAX_RETRIES = 2;

function getStoredAdminToken() {
  return localStorage.getItem("adminToken") || null;
}

export default function DashboardPage() {
  // fetched data
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  // ui state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const retryCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll(isRetry = false) {
      if (!isRetry) {
        setLoading(true);
        setLoadError(false);
      } else {
        setRetrying(true);
      }

            try {
        // request paid bookings only (defensive: backend may already default to paid)
        const token = getStoredAdminToken();

        const [mRes, bRes, uRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/movies`, { timeout: REQUEST_TIMEOUT_MS }),
          axios.get(`${API_BASE}/api/bookings`, {
            params: { paymentStatus: "paid", limit: 1000 },
            timeout: REQUEST_TIMEOUT_MS,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${API_BASE}/api/users`, {
            timeout: REQUEST_TIMEOUT_MS,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        // helper to normalise typical API shapes
        const normaliseArrayResponse = (r) => {
          if (!r) return [];
          if (r.status === "rejected") return [];
          const data = r.value?.data;
          if (!data) return [];
          if (Array.isArray(data)) return data;
          if (Array.isArray(data.items)) return data.items;
          if (Array.isArray(data.rows)) return data.rows;
          if (Array.isArray(data.data)) return data.data;
          if (Array.isArray(data.items)) return data.items;
          return [];
        };

        const rawMovies = normaliseArrayResponse(mRes);
        const rawBookings = normaliseArrayResponse(bRes);
        const rawUsers = normaliseArrayResponse(uRes);

        // normalize movies -> { id, title, basePrice }
        const normMovies = rawMovies.map((m) => ({
          id: m._id || m.id || m.movieId || m.idStr || "",
          title: m.title || m.movieName || m.name || "Untitled",
          basePrice: Number(m.basePrice || m.price || m.ticketPrice || 0) || 0,
        }));

        // normalize bookings -> { id, movieId, movieTitle, seats:[], totalPaid, userId, customer, raw }
        const normBookings = rawBookings.map((b) => {
          const movieId =
            b.movieId || (b.movie && (b.movie.id || b.movie._id)) || "";
          const movieTitle =
            (b.movie && (b.movie.title || b.movie.movieName)) ||
            b.movieName ||
            b.movie ||
            "";
          const seats = Array.isArray(b.seats)
            ? b.seats
                .map((s) =>
                  typeof s === "string" ? s : (s && (s.seatId || s.id)) || ""
                )
                .filter(Boolean)
            : Array.isArray(b.seatIds)
            ? b.seatIds.map(String).filter(Boolean)
            : [];
          // prefer authoritative amount fields
          const totalPaid =
            Number(
              b.amountPaise !== undefined && b.amountPaise !== null
                ? Number(b.amountPaise) / 100
                : b.amount || b.total || 0
            ) || 0;
          const userId =
            b.userId ||
            (b.user && (b.user._id || b.user.id)) ||
            b.customerId ||
            "";
          const customer =
            b.customer ||
            b.customerName ||
            (b.user && (b.user.name || b.user.fullName)) ||
            "";
          return {
            id: b._id || b.id || b.bookingId || "",
            movieId,
            movieTitle,
            seats,
            totalPaid,
            userId,
            customer,
            raw: b,
          };
        });

        // Defensive client-side filter: ensure only paid bookings are used.
        const paidBookings = normBookings.filter((bk) => {
          const raw = bk.raw || {};
          const ps = (
            raw.paymentStatus ||
            raw.payment_status ||
            raw.paymentstate ||
            ""
          )
            .toString()
            .toLowerCase();
          const st = (raw.status || "").toString().toLowerCase();
          // accept booking if paymentStatus === 'paid' or status === 'paid' or we have a positive paid amount
          return ps === "paid" || st === "paid" || Number(bk.totalPaid) > 0;
        });

        // normalize users -> { id, name }
        const normUsers = rawUsers.map((u) => ({
          id: u._id || u.id || u.userId || "",
          name: u.name || u.fullName || u.username || "",
        }));

        const anyRejected = [mRes, bRes, uRes].some(
          (r) => r.status === "rejected"
        );

        if (!cancelled) {
          setMovies(normMovies);
          setBookings(paidBookings);
          setUsers(normUsers);
          setLoadError(anyRejected);
        }

        // auto-retry once/twice if something failed (likely a cold-start backend)
        if (anyRejected && !cancelled && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          setTimeout(() => {
            if (!cancelled) fetchAll(true);
          }, RETRY_DELAY_MS);
        }
      } catch (err) {
        console.error("dashboard fetch error:", err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRetrying(false);
        }
      }
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    // totals from bookings (bookings already filtered to paid bookings)
    const totalBookings = bookings.length;

    let totalRevenue = 0;
    for (let i = 0; i < bookings.length; i++)
      totalRevenue += bookings[i].totalPaid || 0;

    // total users: prefer users API if it returned data, otherwise derive from bookings
    const usersFromApi = new Set(users.map((u) => u.id).filter(Boolean));

    const usersFromBookings = new Set();
    for (let i = 0; i < bookings.length; i++) {
      const b = bookings[i];
      if (b.userId) usersFromBookings.add(String(b.userId));
      else if (b.customer) usersFromBookings.add(String(b.customer));
      else if (b.raw && b.raw.email) usersFromBookings.add(String(b.raw.email));
      else if (b.raw && b.raw.customerEmail)
        usersFromBookings.add(String(b.raw.customerEmail));
    }

    const totalUsers =
      usersFromApi.size > 0 ? usersFromApi.size : usersFromBookings.size;

    // per-movie aggregation — only include movies that actually have bookings
    const map = {};

    // first, build a quick id->title map from movies API
    const movieTitleMap = {};
    for (let i = 0; i < movies.length; i++) {
      const m = movies[i];
      if (m.id) movieTitleMap[m.id] = m.title;
    }

    // aggregate from bookings so only movies with bookings appear
    for (let i = 0; i < bookings.length; i++) {
      const bk = bookings[i];
      const key = bk.movieId || bk.movieTitle || `unknown-${i}`;
      const title = movieTitleMap[bk.movieId] || bk.movieTitle || "Unknown";
      if (!map[key]) map[key] = { id: key, title, bookings: 0, earnings: 0 };
      map[key].bookings += 1;
      map[key].earnings += bk.totalPaid || 0;
    }

    const movieStats = Object.values(map).sort(
      (a, b) => b.bookings - a.bookings
    );

    return { totalBookings, totalRevenue, totalUsers, movieStats };
  }, [movies, bookings, users]);

  const handleManualRetry = () => {
    retryCountRef.current = 0;
    setLoadError(false);
    setLoading(true);
    // re-trigger the effect logic by calling fetchAll indirectly via state change
    // simplest: force a full reload of this run by re-invoking through a key change
    // easiest safe approach: just reload the page section by re-running the effect body
    window.location.reload();
  };

  return (
    <div
      className={styles3.dashboardPageContainer}
      style={fontStyles2.cinzelFont}
    >
      <div className={styles3.maxWidthContainer}>
        {/* Header */}
        <header className={styles3.dashboardHeaderContainer}>
          <div>
            <h1 className={styles3.dashboardTitle}>Dashboard</h1>
            <p className={styles3.dashboardSubtitle}>
              Overview of paid bookings, revenue and users
            </p>
          </div>
        </header>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              padding: "16px 20px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
            }}
          >
            Loading dashboard data… (this can take up to a minute on first
            load if the server was asleep)
          </div>
        )}

        {/* Error / retry banner */}
        {!loading && loadError && (
          <div
            style={{
              padding: "14px 20px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "rgba(220,38,38,0.12)",
              border: "1px solid rgba(220,38,38,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span>
              {retrying
                ? "Some data failed to load — retrying…"
                : "Some data failed to load. The server may have been asleep — try again."}
            </span>
            <button
              onClick={handleManualRetry}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        )}

        <section className={styles3.summaryGrid}>
          <div className={styles3.summaryCard}>
            <div className={styles3.summaryCardInner}>
              <div>
                <div className={styles3.summaryLabel}>Total Bookings</div>
                <div className={styles3.summaryValue}>
                  {summary.totalBookings}
                </div>
              </div>
              <div className={styles3.summaryBadge}>Bookings</div>
            </div>
            <div className={styles3.summaryNote}>Paid orders only</div>
          </div>

          <div className={styles3.summaryCard}>
            <div className={styles3.summaryCardInner}>
              <div>
                <div className={styles3.summaryLabel}>Total Revenue</div>
                <div className={styles3.summaryValue}>
                  {fmtINR(summary.totalRevenue)}
                </div>
              </div>
              <div className={styles3.summaryBadge}>Revenue</div>
            </div>
            <div className={styles3.summaryNote}>Paid bookings summed</div>
          </div>

          <div className={styles3.summaryCard}>
            <div className={styles3.summaryCardInner}>
              <div>
                <div className={styles3.summaryLabel}>Total Users</div>
                <div className={styles3.summaryValue}>{summary.totalUsers}</div>
              </div>
              <div className={styles3.summaryBadge}>Users</div>
            </div>
            <div className={styles3.summaryNote}>
              Registered or booking users
            </div>
          </div>
        </section>

        {/* Movies section */}
        <section className={styles3.moviesSection}>
          <div className={styles3.moviesHeader}>
            <h2 className={styles3.moviesTitle}>
              Movies — Bookings & Earnings
            </h2>
            <div className={styles3.moviesCount}>
              {summary.movieStats.length} movies
            </div>
          </div>

          {/* TABLE - shown on lg and up */}
          <div className={styles3.tableContainer}>
            <table className={styles3.table}>
              <thead>
                <tr className={styles3.tableHeader}>
                  <th className={styles3.tableHeaderCell}>Movie</th>
                  <th className={styles3.tableHeaderCell}>Total Bookings</th>
                  <th className={styles3.tableHeaderCell}>Total Earnings</th>
                  <th className={styles3.tableHeaderCell}>Avg per Booking</th>
                </tr>
              </thead>

              <tbody>
                {summary.movieStats.map((m) => {
                  const avg = m.bookings
                    ? Math.round(m.earnings / m.bookings)
                    : 0;
                  return (
                    <tr key={m.id} className={styles3.tableRow}>
                      <td className={styles3.tableCell}>
                        <div className={styles3.tableMovieTitle}>{m.title}</div>
                      </td>
                      <td className={styles3.tableCell}>{m.bookings}</td>
                      <td className={styles3.tableEarnings}>
                        {fmtINR(m.earnings)}
                      </td>
                      <td className={styles3.tableAvg}>{fmtINR(avg)}</td>
                    </tr>
                  );
                })}

                {!loading && summary.movieStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles3.tableEmpty}>
                      No movie data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE / TABLET LIST */}
          <div className={styles3.mobileList}>
            {summary.movieStats.map((m) => {
              const avg = m.bookings ? Math.round(m.earnings / m.bookings) : 0;
              return (
                <div key={m.id} className={styles3.mobileCard}>
                  <div className={styles3.mobileCardInner}>
                    <div>
                      <div className={styles3.mobileMovieTitle}>{m.title}</div>
                      <div className={styles3.mobileLabel}>
                        Bookings:{" "}
                        <span className={styles3.mobileValue}>
                          {m.bookings}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={styles3.mobileEarnings}>
                        {fmtINR(m.earnings)}
                      </div>
                      <div className={styles3.mobileAvgLabel}>
                        Avg:{" "}
                        <span className={styles3.mobileAvgValue}>
                          {fmtINR(avg)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!loading && summary.movieStats.length === 0 && (
              <div className={styles3.mobileEmpty}>No movie data yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}