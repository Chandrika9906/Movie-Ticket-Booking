import React from "react";
import Home from "./pages/Home/Home";
import ListMovies from "./pages/ListMovies/ListMovies";

import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import BookingsPage from "./pages/BookingsPage/BookingsPage";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listmovies" element={<ListMovies />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Routes>
  );
}
