// routes/bookingRoutes.js
import express from "express";
import {
  createBooking,
  getBooking,
  listBookings,

  confirmPayment,
  deleteBooking,
  getOccupiedSeats,
} from "../controllers/bookingController.js";
import authMiddleware from "../middlewares/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/", authMiddleware, createBooking);
bookingRouter.get("/confirm-payment", confirmPayment);
bookingRouter.get("/", listBookings);
bookingRouter.get("/occupied",getOccupiedSeats);

// Specific static routes must come BEFORE dynamic routes like "/:id"
bookingRouter.get("/my",authMiddleware, getBooking);
bookingRouter.delete("/:id", deleteBooking);

export default bookingRouter;
