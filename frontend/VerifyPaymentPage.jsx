// src/pages/VerifyPaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyPaymentPage = () => {
  const [statusMsg, setStatusMsg] = useState("Verifying payment...");
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search || "";

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const params = new URLSearchParams(search);
      // Trim session_id to remove accidental whitespace
      const rawSession = params.get("session_id");
      const session_id = rawSession ? rawSession.trim() : null;
      const payment_status = params.get("payment_status");
      const token = localStorage.getItem("token");

      // If user canceled on Stripe-hosted checkout page
      if (payment_status === "cancel") {
        navigate("/checkout", { replace: true });
        return;
      }

      if (!session_id) {
        setStatusMsg("No session_id provided in the URL.");
        return;
      }

      try {
        setStatusMsg("Confirming payment with server...");

        const API_BASE = "http://localhost:5000";
        const res = await axios.get(
          `${API_BASE}/api/bookings/confirm-payment`,
          {
            params: { session_id },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            timeout: 15000,
          }
        );

        if (cancelled) return;

        if (res?.data?.success) {
          setStatusMsg("Payment confirmed. Redirecting...");
          navigate("/bookings", { replace: true });
          return;
        } else {
          const msg = res?.data?.message || "Payment not completed.";
          setStatusMsg(msg);
        }
      } catch (err) {
        console.error("Verification error:", err);

        // show server message if present, but handle 404 specially
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;

        if (status === 404) {
          setStatusMsg(
            serverMsg ||
              "Payment session not found. If you were charged, contact support with your session id."
          );
        } else if (status === 400) {
          setStatusMsg(
            serverMsg || "Payment not completed or invalid request."
          );
        } else {
          setStatusMsg(
            serverMsg ||
              "There was an error confirming your payment. If you were charged, please contact support."
          );
        }
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-4">
      <div className="text-center max-w-lg">
        <p className="mb-2">{statusMsg}</p>
        <p className="text-sm opacity-70">
          If this page shows "session not found", try copying the `session_id`
          from your browser URL and verify it with your backend logs or contact
          support.
        </p>
      </div>
    </div>
  );
};

export default VerifyPaymentPage;
