# 🎬 Movie Ticket Booking App

A full-stack movie ticket booking platform with a user-facing frontend, an admin dashboard, and a Node.js/Express REST API backend — all deployed and live.

---

## 🌐 Deployed URLs

| App | URL |
|---|---|
| **Frontend (User)** | https://movie-ticket-booking-frontend-chi.vercel.app |
| **Admin Dashboard** | https://movie-ticket-booking-admin-gamma.vercel.app |
| **Backend API** | https://movie-ticket-booking-backend-llot.onrender.com |

---

## 📁 Project Structure

```
Movie-Ticket-Booking/
└── MovieBooking/
    ├── frontend/       # React user-facing app (Vite + Tailwind)
    ├── admin/          # React admin dashboard (Vite + Tailwind)
    └── backend/        # Node.js + Express REST API
```

---

## ✨ Features

### User Frontend
- Browse now-showing and upcoming movies
- View movie details, trailers, and cast info
- Select seats interactively
- Book tickets with Stripe payment integration
- View personal booking history
- User registration and login (JWT-based)
- QR code generation for booked tickets

### Admin Dashboard
- Secure admin login (role-based access)
- Add, list, and delete movies with poster/media uploads
- View all bookings across users
- Dashboard overview stats

### Backend API
- JWT authentication & role-based authorization
- Movie CRUD with `multer` file uploads
- Seat occupancy tracking per show slot
- Stripe payment session creation & confirmation
- MongoDB via Mongoose

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, Axios, React Toastify, Lucide React, QRCode |
| Admin | React 19, Vite, Tailwind CSS v4, React Router v7, Axios, React Hot Toast |
| Backend | Node.js, Express 5, MongoDB, Mongoose, JWT, bcrypt, Multer, Stripe, dotenv |
| Deployment | Vercel (frontend + admin), Render (backend) |

---

## 🚀 Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas URI or local MongoDB
- Stripe account (for payment keys)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/Movie-Ticket-Booking.git
cd Movie-Ticket-Booking/MovieBooking
```

---

### 2. Backend

```bash
cd backend
```

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=http://localhost:5173
```

Install and run:

```bash
npm install
npm start
```

Backend runs on `http://localhost:5000`

---

### 3. Frontend (User App)

```bash
cd frontend
```

Create a `.env` file:

```env
VITE_API_BASE=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

Install and run:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

### 4. Admin Dashboard

```bash
cd admin
```

Create a `.env` file:

```env
VITE_API_BASE=http://localhost:5000
```

Install and run:

```bash
npm install
npm run dev
```

Admin runs on `http://localhost:5174`

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Login (returns JWT) |
| GET | `/verify-admin` | Verify admin role |

### Movies — `/api/movies`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all movies |
| GET | `/:id` | Get movie by ID |
| POST | `/` | Add a movie (with file uploads) |
| DELETE | `/:id` | Delete a movie |

### Bookings — `/api/bookings`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a booking (auth required) |
| GET | `/` | List all bookings (auth required) |
| GET | `/my` | Get current user's bookings (auth required) |
| GET | `/occupied` | Get occupied seats for a slot |
| GET | `/confirm-payment` | Stripe payment confirmation |
| DELETE | `/:id` | Delete a booking |

### Users — `/api/users`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all users (admin only) |

---

## 📄 Frontend Pages & Routes

| Route | Component | Description |
|---|---|---|
| `/` | Home | Landing page with banner, movies, trailers, news |
| `/movies` | Movie | All movies listing |
| `/movies/:id` | MovieDetailPage | Movie detail from movies section |
| `/movies/:id/seat/:slot` | SeatSelectorPage | Seat selection from movies section |
| `/releases` | Release | Upcoming releases |
| `/contact` | Contact | Contact page |
| `/login` | Login | User / Admin login |
| `/signup` | SignUp | User registration |
| `/bookings` | Booking | User's booking history |
| `/movie/:id` | MovieDetailPageHome | Movie detail from home section |
| `/movie/:id/seat/:slot` | SeatSelectorPageHome | Seat selection from home section |
| `/success` | VerifyPaymentPage | Stripe payment success |
| `/cancel` | VerifyPaymentPage | Stripe payment cancelled |

---

## 🖥️ Admin Pages

| Route | Component | Description |
|---|---|---|
| `/` | DashboardPage | Overview stats |
| `/add` | AddPage | Add a new movie with media uploads |
| `/list` | ListMoviesPage | View and delete movies |
| `/bookings` | Bookings | View all user bookings |

---

## 💳 Payment Flow

1. User selects seats and proceeds to checkout
2. Backend creates a Stripe Checkout Session
3. User is redirected to Stripe's hosted payment page
4. On success, Stripe redirects to `/success?session_id=...`
5. `VerifyPaymentPage` calls `/api/bookings/confirm-payment` to confirm and save the booking
6. A QR code is generated for the confirmed ticket

---

## 🔐 Authentication Flow

- Users register/login via `/api/auth/register` and `/api/auth/login`
- JWT token is returned and stored in `localStorage`
- Protected routes use `authMiddleware` to verify the token
- Admin routes additionally use `adminOnly` middleware to check `role === "admin"`
- On login, if `loginType === "admin"` is selected but the account is not an admin, access is denied
- Admin is redirected to the admin dashboard URL with the token as a query param

---

## 🗂️ Environment Variables Summary

### Backend `.env`
```env
MONGODB_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
FRONTEND_URL=
```

### Frontend `.env`
```env
VITE_API_BASE=
VITE_STRIPE_PUBLIC_KEY=
```

### Admin `.env`
```env
VITE_API_BASE=
```

---

## 📦 Deployment

### Vercel (Frontend & Admin)
- Both `frontend/` and `admin/` are deployed as separate Vercel projects
- Each has a `vercel.json` with SPA rewrite rules so React Router works correctly
- Set the environment variables in the Vercel project settings

### Render (Backend)
- `backend/` is deployed as a Web Service on Render
- Set all backend environment variables in the Render dashboard
- The `uploads/` folder serves static movie poster images via `/uploads` route

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
