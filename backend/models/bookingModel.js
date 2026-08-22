// models/bookingModel.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    // optional reference to the movie document (used in queries/conflict checks)
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: false },

    // optional reference to the user who booked
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },

    // who booked (required)
    customer: { type: String, required: true, trim: true },

    // lightweight movie snapshot
    movie: {
      id: { type: Schema.Types.ObjectId, ref: "Movie", required: false },
      title: { type: String, default: "" },
      poster: { type: String, default: "" },
      // store duration in minutes to match controller's durationMins
      durationMins: { type: Number, default: 0 },
      category: { type: String, default: "" },
      year: { type: Number, default: null },
      rating: { type: Number, default: null },
    },

    // showtime & auditorium
    showtime: { type: Date, required: true, index: true },
    auditorium: { type: String, default: "Audi 1", index: true },

    // seats: mixed entries allowed (strings or objects). Validator ensures non-empty array.
    seats: {
      type: [Schema.Types.Mixed],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "seats must be a non-empty array",
      },
    },

    // pricing
    basePrice: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }, // total in main currency units (e.g. rupees)
    amountPaise: { type: Number, default: 0 }, // ADDED: authoritative amount in paise
    currency: { type: String, default: "INR" },

    // status & payment
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "paid", "active", "upcoming"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "" },
    paymentSessionId: { type: String, default: "" },
    paymentIntentId: { type: String, default: "" },

    // store stripe session meta (optional)
    stripeSession: { type: Schema.Types.Mixed, default: null },

    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Compound index for efficient occupied seat queries
bookingSchema.index({ showtime: 1, auditorium: 1, status: 1 });
bookingSchema.index({ movieId: 1, showtime: 1, auditorium: 1 });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);