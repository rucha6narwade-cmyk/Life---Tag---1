import React, { useState } from "react";
import apiClient from "../api";

const VerifyDoctor = () => {
  const [regNo, setRegNo] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("doctorToken");

  const submitReg = async (e) => {
    e.preventDefault();

    try {
      const res = await apiClient.post(
        "/verify/doctor/verify-registration",
        { registrationNumber: regNo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="verify-page">
      <h2>Doctor Registration Verification</h2>

      <form onSubmit={submitReg}>
        <input 
          type="text" 
          placeholder="Enter Registration Number"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
          required
        />

        <button className="primary-button glossy-btn" type="submit">
          Verify
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default VerifyDoctor;
