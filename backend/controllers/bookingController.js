import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Movie from "../models/movieModel.js";
import User from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const CLIENT_URL_LOCAL = process.env.CLIENT_URL || "http://localhost:5173";
const CLIENT_URL_DEPLOYED = "https://movie-ticket-booking-frontend-woad.vercel.app";

function resolveClientUrl(req) {
  const origin = req.headers.origin || req.headers.referer || "";
  if (origin.startsWith("http://localhost")) return CLIENT_URL_LOCAL;
  if (origin.startsWith(CLIENT_URL_DEPLOYED)) return CLIENT_URL_DEPLOYED;
  return CLIENT_URL_DEPLOYED;
}
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_API_VERSION = "2022-11-15";
const RECLINER_ROWS = new Set(["D", "E"]);
const BLOCKING_STATUSES = ["pending", "paid", "confirmed", "active", "upcoming"];

function getStripeOrThrow() {
  if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY in env");
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });
}

function normalizeShowtimeToMinute(input) {
  let d = new Date(input);
  if (isNaN(d.getTime())) {
    try { d = new Date(decodeURIComponent(String(input))); } catch { d = new Date(String(input)); }
  }
  if (isNaN(d.getTime())) throw new Error("Invalid showtime");
  d.setSeconds(0, 0);
  return d;
}

function buildMovieMatchClause(movieId, movieName) {
  const push = (arr, obj) => { if (obj && Object.keys(obj).length) arr.push(obj); };
  const clauses = [];

  if (movieId) {
    const mid = String(movieId).trim();
    if (mid) {
      if (mongoose.Types.ObjectId.isValid(mid)) {
        push(clauses, { "movie.id": new mongoose.Types.ObjectId(mid) });
        push(clauses, { movieId: new mongoose.Types.ObjectId(mid) });
      }
      push(clauses, { "movie.id": mid });
      push(clauses, { movieId: mid });
    }
  }

  if (movieName) {
    const mname = String(movieName).trim();
    if (mname) {
      push(clauses, { "movie.title": mname });
      push(clauses, { movieName: mname });
      push(clauses, { "movie.movieName": mname });
    }
  }

  const seen = new Set();
  const unique = [];
  for (const c of clauses) {
    const k = JSON.stringify(c);
    if (!seen.has(k)) { seen.add(k); unique.push(c); }
  }
  return unique;
}

function computeTotalPaiseFromSeats(movie = {}, seats = [], options = {}) {
  const allowClientPrice = options.allowClientPrice === true;
  const standardRupee = Number(movie?.seatPrices?.standard ?? movie?.price ?? 0) || 0;
  const standardPaise = Math.round(standardRupee * 100);
  const reclinerDefined = typeof movie?.seatPrices?.recliner !== "undefined" && movie?.seatPrices?.recliner !== null;
  const reclinerPaise = reclinerDefined
    ? Math.round(Number(movie.seatPrices.recliner) * 100)
    : Math.round(standardPaise * 1.5);

  let total = 0;
  for (const s of seats) {
    if (!s) continue;
    if (allowClientPrice && typeof s === "object" && s.price !== undefined && s.price !== null) {
      const p = Number(s.price);
      if (!Number.isNaN(p) && p >= 0) { total += Math.round(p * 100); continue; }
    }
    let seatId = typeof s === "string" ? s : String(s.seatId || s.id || s.name || "");
    seatId = String(seatId).trim();
    if (!seatId) continue;
    const row = seatId.charAt(0).toUpperCase();
    total += RECLINER_ROWS.has(row) ? reclinerPaise : standardPaise;
  }
  return Math.max(0, Math.round(total));
}

function normalizeSeatsFromInput(rawSeats = [], seatIdsFromBody = [], movie = {}) {
  const normalized = [];
  const deriveServerPrice = (row) => {
    const isRecliner = RECLINER_ROWS.has(row);
    const base = Number(movie?.seatPrices?.standard ?? movie?.price ?? 0);
    if (isRecliner) return Number(movie?.seatPrices?.recliner ?? Math.round(base * 1.5));
    return base;
  };

  if (Array.isArray(rawSeats) && rawSeats.length > 0) {
    if (typeof rawSeats[0] === "object") {
      for (const s of rawSeats) {
        const seatIdVal = String(s.seatId || s.id || s).trim().toUpperCase();
        if (!seatIdVal) continue;
        const row = seatIdVal.charAt(0).toUpperCase();
        const type = s.type || (RECLINER_ROWS.has(row) ? "recliner" : "standard");
        let price = 0;
        if (s.price !== undefined && s.price !== null) {
          const p = Number(s.price);
          if (!Number.isNaN(p) && p >= 0) price = p;
        } else price = deriveServerPrice(row);
        normalized.push({ seatId: seatIdVal, type, price });
      }
    } else {
      for (const sid of rawSeats) {
        const seatIdVal = String(sid).trim().toUpperCase();
        if (!seatIdVal) continue;
        const row = seatIdVal.charAt(0).toUpperCase();
        const type = RECLINER_ROWS.has(row) ? "recliner" : "standard";
        normalized.push({ seatId: seatIdVal, type, price: deriveServerPrice(row) });
      }
    }
  } else if (Array.isArray(seatIdsFromBody) && seatIdsFromBody.length > 0) {
    for (const sid of seatIdsFromBody) {
      const seatIdVal = String(sid).trim().toUpperCase();
      if (!seatIdVal) continue;
      const row = seatIdVal.charAt(0).toUpperCase();
      const type = RECLINER_ROWS.has(row) ? "recliner" : "standard";
      normalized.push({ seatId: seatIdVal, type, price: deriveServerPrice(row) });
    }
  }
  return normalized;
}

/* ---------- Controllers ---------- */

export async function createBooking(req, res) {
  try {
    const CLIENT_URL = resolveClientUrl(req);
    console.log("ORIGIN:", req.headers.origin, "REFERER:", req.headers.referer, "RESOLVED:", CLIENT_URL);

    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required to create booking" });
    const body = req.body || {};
    const movieId = body.movieId || null;
    const movieName = body.movieName || body.movie?.title || "";
    const auditorium = body.audi || body.auditorium || "Audi 1";
    const rawSeats = Array.isArray(body.seats) ? body.seats.filter(Boolean) : [];
    const seatIdsFromBody = Array.isArray(body.seatIds) ? body.seatIds.filter(Boolean) : [];
    const customer = String(body.customer || (req.user && (req.user.name || req.user.fullName)) || "Guest");
    const email = String(req.user.email || "");
    const paymentMethod = String(body.paymentMethod || "card").toLowerCase();
    const currency = String(body.currency || "inr").toLowerCase();

    if (!body.showtime || (rawSeats.length === 0 && seatIdsFromBody.length === 0) || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields (showtime/seats/email)" });
    }

    let showtime;
    try { showtime = normalizeShowtimeToMinute(body.showtime); } catch { return res.status(400).json({ success: false, message: "Invalid showtime" }); }

    // best-effort movie load
    let movie = null;
    if (movieId && mongoose.Types.ObjectId.isValid(String(movieId))) {
      movie = await Movie.findById(movieId).lean().exec().catch(() => null);
    } else if (movieName) {
      movie = await Movie.findOne({ $or: [{ title: movieName }, { movieName }] }).lean().exec().catch(() => null);
    }

    const normalizedSeats = normalizeSeatsFromInput(rawSeats, seatIdsFromBody, movie);
    if (normalizedSeats.length === 0) return res.status(400).json({ success: false, message: "No valid seats provided" });

    const totalPaise = computeTotalPaiseFromSeats(movie, normalizedSeats, { allowClientPrice: true });
    if (!totalPaise || totalPaise <= 0) return res.status(400).json({ success: false, message: "Computed amount is zero" });
    const totalMain = Number((totalPaise / 100).toFixed(2));

    // conflict detection (minute window)
    const startWindow = new Date(showtime);
    const endWindow = new Date(startWindow.getTime() + 60 * 1000);
    const conflictQuery = {
      showtime: { $gte: startWindow, $lt: endWindow },
      auditorium,
      status: { $in: BLOCKING_STATUSES }
    };
    const movieClauses = buildMovieMatchClause(movieId, movieName);
    if (movieClauses.length > 0) conflictQuery.$or = movieClauses;

    const existingBookings = await Booking.find(conflictQuery, { seats: 1 }).lean().exec();
    const occupiedSeats = new Set();
    for (const b of existingBookings || []) {
      const seats = Array.isArray(b.seats) ? b.seats : [];
      for (const seat of seats) {
        const seatId = typeof seat === "string"
          ? seat.trim().toUpperCase()
          : (seat?.seatId || seat?.id || "").toString().trim().toUpperCase();
        if (seatId) occupiedSeats.add(seatId);
      }
    }

    const seatIdList = Array.from(new Set(normalizedSeats.map(s => s.seatId)));
    const conflictingSeats = seatIdList.filter(s => occupiedSeats.has(s));

    // movie snapshot + top-level searchable fields
    const movieSnapshot = movie
      ? {
        id: movie._id,
        title: movie.movieName || movie.title || "",
        poster: movie.poster || movie.thumbnail || "",
        category: Array.isArray(movie.categories) ? movie.categories[0] || "" : movie.category || "",
        durationMins: movie.duration || movie.runtime || 0,
        rating: movie.rating || null
      }
      : {
        id: movieId && mongoose.Types.ObjectId.isValid(String(movieId)) ? new mongoose.Types.ObjectId(movieId) : undefined,
        title: movieName || "",
        poster: "",
        category: "",
        durationMins: 0
      };

    const doc = {
      userId: req.user && req.user._id ? new mongoose.Types.ObjectId(req.user._id) : undefined,
      customer,
      movie: movieSnapshot,
      movieId: movieSnapshot.id,
      movieName: movieSnapshot.title,
      showtime,
      auditorium,
      seats: normalizedSeats,
      basePrice: movie?.seatPrices?.standard ?? movie?.price ?? 0,
      amount: totalMain,
      amountPaise: totalPaise,
      currency: (currency || "INR").toUpperCase(),
      status: paymentMethod === "card" ? "pending" : "confirmed",
      paymentStatus: paymentMethod === "card" ? "pending" : "paid",
      paymentMethod,
      meta: { rawRequest: { seatIds: seatIdList, clientSeats: rawSeats } }
    };

    const booking = await Booking.create(doc);

    if (paymentMethod === "card") {
  let stripe;

  try {
    stripe = getStripeOrThrow();
  } catch (err) {
    await Booking.findByIdAndDelete(booking._id).catch(() => {});
    return res.status(500).json({
      success: false,
      message: "Payment not configured",
      error: err.message
    });
  }

  let user = await User.findById(req.user._id);

  if (!user) {
    await Booking.findByIdAndDelete(booking._id).catch(() => {});
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customerObj = await stripe.customers.create({
      email: user.email,
      name: user.fullName,
      metadata: {
        userId: String(user._id)
      }
    });

    stripeCustomerId = customerObj.id;

    user.stripeCustomerId = stripeCustomerId;
    await user.save();
  }

      try {
        const amountPaiseForStripe = Number(doc.amountPaise);
        const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "payment",

  customer: stripeCustomerId,

  payment_intent_data: {
    setup_future_usage: "off_session"
  },
          line_items: [{
            price_data: {
              currency,
              product_data: { name: booking.movie.title || "Movie Booking", description: `Seats: ${seatIdList.join(", ")} — ${auditorium}` },
              unit_amount: amountPaiseForStripe
            },
            quantity: 1
          }],
          success_url: `${CLIENT_URL}/bookings`,
          cancel_url: `${CLIENT_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,
          metadata: { bookingId: String(booking._id), seats: JSON.stringify(seatIdList), auditorium, showtime: showtime.toISOString() }
        });

        booking.paymentSessionId = session.id;
        booking.stripeSession = { id: session.id, url: session.url || null };
        await Booking.findByIdAndUpdate(booking._id, { paymentSessionId: session.id, stripeSession: booking.stripeSession }).exec();

        return res.status(201).json({
          success: true,
          message: "Booking created (pending payment)",
          booking: { id: booking._id, status: booking.status, amount: doc.amount, amountPaise: doc.amountPaise, currency: doc.currency },
          checkout: { id: session.id, url: session.url }
        });
      } catch (stripeErr) {
        await Booking.findByIdAndDelete(booking._id).catch(() => { });
        return res.status(500).json({ success: false, message: "Failed to create Stripe session", error: String(stripeErr.message || stripeErr) });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Booking created",
      booking: { id: booking._id, status: booking.status, amount: booking.amount, amountPaise: booking.amountPaise, currency: booking.currency }
    });
  } catch (err) {
    console.error("createBooking error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: "Server error", error: String(err.message || err) });
  }
}

export async function getBooking(req, res) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const userId = String(req.user._id || req.user.id);
    const { paymentStatus, status } = req.query;

    const q = { userId };

    // if the caller explicitly requests "all" skip default filter
    if (paymentStatus && String(paymentStatus).toLowerCase() !== "all") {
      q.paymentStatus = String(paymentStatus).toLowerCase();
    } else if (status && String(status).toLowerCase() !== "all") {
      q.status = String(status).toLowerCase();
    } else {
      // default: show only paid bookings for users
      q.paymentStatus = "paid";
    }

    const items = await Booking.find(q).sort({ createdAt: -1 }).lean().exec();
    return res.json({ success: true, items });
  } catch (err) {
    console.error("getBookings error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function listBookings(req, res) {
  try {
    const { movieId, page = 1, limit = 100, paymentStatus, status } = req.query;
    const q = {};

    if (movieId) {
      if (mongoose.Types.ObjectId.isValid(String(movieId))) q.movieId = new mongoose.Types.ObjectId(String(movieId));
      else q.movieName = String(movieId);
    }

    if (paymentStatus && String(paymentStatus).toLowerCase() !== "all") {
      q.paymentStatus = String(paymentStatus).toLowerCase();
    } else if (status && String(status).toLowerCase() !== "all") {
      q.status = String(status).toLowerCase();
    } else {
      // default for listing endpoints: only paid bookings
      q.paymentStatus = "paid";
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(1000, Number(limit) || 100);
    const total = await Booking.countDocuments(q).exec();
    const items = await Booking.find(q).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean().exec();
    return res.json({ success: true, total, page: pg, limit: lim, items });
  } catch (err) {
    console.error("listBookings error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const b = await Booking.findByIdAndDelete(id).lean().exec();
    if (!b) return res.status(404).json({ success: false, message: "Booking not found" });
    return res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    console.error("deleteBooking error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getOccupiedSeats(req, res) {
  try {
    const { movieId, movieName, showtime: showtimeRaw, audi: audiRaw } = req.query;
    if (!showtimeRaw) return res.status(400).json({ success: false, message: "showtime query param required" });

    const auditorium = String(audiRaw || req.query.auditorium || "Audi 1");
    let parsed;
    try { parsed = normalizeShowtimeToMinute(showtimeRaw); } catch { return res.status(400).json({ success: false, message: "Invalid showtime" }); }

    const start = new Date(parsed);
    const end = new Date(start.getTime() + 60 * 1000);
    const q = { showtime: { $gte: start, $lt: end }, auditorium, status: { $in: BLOCKING_STATUSES } };
    const movieClauses = buildMovieMatchClause(movieId, movieName);
    if (movieClauses.length > 0) q.$or = movieClauses;

    if (!Booking) {
      console.error("Booking model undefined");
      return res.status(500).json({ success: false, message: "Server misconfiguration (Booking model)" });
    }

    const docs = await Booking.find(q, { seats: 1 }).lean().exec();
    const occupiedSet = new Set();
    for (const d of docs || []) {
      const sarr = Array.isArray(d.seats) ? d.seats : [];
      for (const s of sarr) {
        if (!s) continue;
        let seatId = "";
        if (typeof s === "string") seatId = s.trim().toUpperCase();
        else if (s.seatId) seatId = String(s.seatId).trim().toUpperCase();
        else if (s.id) seatId = String(s.id).trim().toUpperCase();
        else if (s.number) seatId = String(s.number).trim().toUpperCase();
        if (seatId) occupiedSet.add(seatId);
      }
    }
    return res.json({ success: true, occupied: [...occupiedSet] });
  } catch (err) {
    console.error("getOccupiedSeats error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: "Server error while fetching occupied seats", error: String(err.message || err) });
  }
}

export async function confirmPayment(req, res) {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ success: false, message: "session_id required" });

    let stripe;
    try { stripe = getStripeOrThrow(); } catch (err) {
      return res.status(500).json({ success: false, message: "Payments not configured", error: err.message });
    }

    const sessionObj = await stripe.checkout.sessions.retrieve(session_id);
    if (!sessionObj) return res.status(404).json({ success: false, message: "Session not found" });
    if (sessionObj.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: `Payment not completed (status=${sessionObj.payment_status})` });
    }

    const bookingId = sessionObj.metadata?.bookingId;
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid bookingId in session metadata" });
    }

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "paid",
      status: "confirmed",
      paymentIntentId: sessionObj.payment_intent || ""
    }, { new: true }).exec();

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found for this session" });

    return res.json({ success: true, booking });
  } catch (err) {
    console.error("confirmPayment error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: "Server error", error: String(err.message || err) });
  }
}

export default {
  createBooking,
  getBooking,
  listBookings,
  deleteBooking,
  getOccupiedSeats,
  confirmPayment
};
