import React, { useState } from "react";
import apiClient from "../api";
import { useAuth } from "../components/context/AuthContext";
import "./PageWrapper.css";

const VerifyDoctor = () => {
  const { auth } = useAuth();

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await apiClient.post(
        "/verify/doctor/verify-registration",
        { registrationNumber },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      setMessage("Registration successfully verified!");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }

    setLoading(false);
  };

  return (
    <div className="page-wrapper center-content">
      <div className="glass-card" style={{ maxWidth: "420px" }}>
        <h2 style={{ textAlign: "center" }}>Verify Medical Registration</h2>
        <p style={{ fontSize: "0.9rem", textAlign: "center", opacity: 0.8 }}>
          Enter your official medical registration number to complete your doctor verification.
        </p>

        <form onSubmit={handleVerify}>
          <label>Medical Registration Number</label>
          <input
            type="text"
            className="modern-input"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="e.g. MMC-123456"
            required
          />

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <button
            type="submit"
            className="primary-button glossy-btn"
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Verifying..." : "Verify Registration"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyDoctor;
