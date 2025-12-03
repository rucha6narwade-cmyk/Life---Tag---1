import React, { useState } from "react";
import apiClient from "../api";

const ReportUser = ({ reporterRole }) => {
  const [reportedId, setReportedId] = useState("");
  const [reportedRole, setReportedRole] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  const token =
    reporterRole === "doctor"
      ? localStorage.getItem("doctorToken")
      : localStorage.getItem("patientToken");

  const submitReport = async (e) => {
    e.preventDefault();

    try {
      const res = await apiClient.post(
        "/reports",
        {
          reportedUserId: reportedId,
          reportedUserRole: reportedRole.toLowerCase(),
          reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("Report Submitted Successfully!");
    } catch (err) {
      setMsg("Error submitting report");
    }
  };

  return (
    <div className="report-form-container">
      <h2>Report User</h2>

      <form onSubmit={submitReport}>
        <label>User Role</label>
        <select value={reportedRole} onChange={(e) => setReportedRole(e.target.value)} required>
          <option value="">Select</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <label>User ID</label>
        <input
          type="number"
          value={reportedId}
          onChange={(e) => setReportedId(e.target.value)}
          required
        />

        <label>Reason</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} required />

        <button type="submit" className="primary-button glossy-btn">Submit Report</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
};

export default ReportUser;
