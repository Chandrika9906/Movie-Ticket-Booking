import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import ListMovies from "./pages/ListMovies/ListMovies";
import Dashboard from "./pages/Dashboard/Dashboard";
import BookingsPage from "./pages/BookingsPage/BookingsPage";

export default function App() {
  console.log("APP.JSX IS RUNNING");   // add this line
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Effect ran, search:", location.search);
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    console.log("token found:", token);

    if (token) {
      localStorage.setItem("adminToken", token);
      navigate("/dashboard", { replace: true });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listmovies" element={<ListMovies />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bookings" element={<BookingsPage />} />
    </Routes>
  );
}