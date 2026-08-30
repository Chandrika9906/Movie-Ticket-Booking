import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import { connectDB } from './config/db.js';
import path from 'path';
import movieRouter from './routes/movieRouter.js';
import userRouter from './routes/userRouter.js';
import bookingRouter from './routes/bookingRouter.js';

const app = express();
const port = 5000;

// Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Routes
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); 
app.use("/api/auth", userRouter)
app.use("/api/movies", movieRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/users", userRouter);

app.get('/', (req, res) => {
    res.send('API Working');
});


app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
});
