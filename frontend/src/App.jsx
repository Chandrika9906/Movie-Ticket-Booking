// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home/Home";
import Movie from "./pages/Movie/Movie";
import Release from "./pages/Release/Release";
import Contact from "./pages/Contact/Contact";
import SignUp from "./pages/SignUp/SignUp";
import Login from "./pages/Login/Login";
import MovieDetailPage from "./pages/MovieDetailPage/MovieDetailPage";
import SeatSelectorPage from "./components/SeatSelectorPage/SeatSelectorPage";
import MovieDetailPageHome from "./pages/MovieDetailPageHome/MovieDetailPageHome";
import SeatSelectorPageHome from "./components/SeatSelectorPageHome/SeatSelectorPageHome";
import Booking from "./pages/Booking/Booking";
import VerifyPaymentPage from "../VerifyPaymentPage";

/**
 * ScrollToTop component:
 * - Forces an immediate jump to the very top on every navigation.
 * - If URL has a hash, it will try to jump to that element (also immediately).
 * - Disables browser's automatic scroll restoration to avoid the browser restoring previous positions.
 */
function ScrollToTop() {
  const location = useLocation();

  // Disable browser auto scroll restoration (do once)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "scrollRestoration" in window.history
    ) {
      try {
        window.history.scrollRestoration = "manual";
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    // If there's a hash (e.g. /page#section), try to jump to that element
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el =
        document.getElementById(id) || document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({
          behavior: "auto",
          block: "start",
          inline: "nearest",
        });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        return;
      }
    }

    // Force immediate top-of-page
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.search, location.hash]);

  return null;
}

const App = () => {
  // Ensure no horizontal overflow on the root document (defensive)
  useEffect(() => {
    const prevHtmlOverflowX = document.documentElement.style.overflowX;
    const prevBodyOverflowX = document.body.style.overflowX;

    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    return () => {
      // restore previous values just in case other scripts rely on them
      document.documentElement.style.overflowX = prevHtmlOverflowX;
      document.body.style.overflowX = prevBodyOverflowX;
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      {/* Root wrapper prevents horizontal scroll from any child */}
      <div className="min-h-screen w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movie />} />
          <Route path="/releases" element={<Release />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/bookings" element={<Booking />} />

          <Route path="/movie/:id" element={<MovieDetailPageHome />} />

          <Route
            path="/movie/:id/seat/:slot"
            element={<SeatSelectorPageHome />}
          />
          <Route
            path="/movie/:id/seat-selector/:slot"
            element={<SeatSelectorPageHome />}
          />

          <Route path="/movies/:id" element={<MovieDetailPage />} />

          <Route path="/movies/:id/seat/:slot" element={<SeatSelectorPage />} />
          <Route
            path="/movies/:id/seat-selector/:slot"
            element={<SeatSelectorPage />}
          />

          <Route path="/success" element={<VerifyPaymentPage />} />
          <Route path="/cancel" element={<VerifyPaymentPage />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
