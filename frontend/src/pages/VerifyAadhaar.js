// src/pages/VerifyAadhaar.js
import React, { useState } from "react";


import apiClient from "../api";

import { useAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Aadhaar.css";

const VerifyAadhaar = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!auth || auth.role !== "patient") {
    return (
      <div className="verify-container">
        <div className="verify-card">
          <p>You are not allowed to access this page.</p>
        </div>
      </div>
    );
  }

  // ---------- Step 1: Send OTP ----------
  const sendOtp = async () => {
    if (!/^\d{12}$/.test(aadhaar)) {
      setMessage("Aadhaar must be exactly 12 digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/verify/aadhaar/send-otp", {
        aadhaarNumber: aadhaar,
        patientId: auth.internalId,
      });

      setMessage(`OTP sent (Prototype Mode): ${res.data.otp}`);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  // ---------- Step 2: Verify OTP ----------
  const verifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter OTP");
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/verify/aadhaar/verify", {
        otp,
        patientId: auth.internalId,
        aadhaarNumber: aadhaar,
      });

      setMessage("✅ Aadhaar Verified Successfully!");

      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    }

    setLoading(false);
  };

  return (
    <div className="verify-container">
      <div className="verify-card">

        <h2>Aadhaar Verification</h2>

        {step === 1 && (
          <>
            <label>Aadhaar Number</label>
            <input
              type="text"
              className="modern-input"
              placeholder="Enter 12-digit Aadhaar"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
            />

            <button
              className="primary-button glossy-btn"
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label>Enter OTP</label>
            <input
              type="text"
              className="modern-input"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              className="primary-button glossy-btn"
              onClick={verifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Aadhaar"}
            </button>
          </>
        )}

        {message && <p className="status-text">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyAadhaar;
