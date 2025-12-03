import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-grid">
        <div className="admin-card" onClick={() => navigate("/admin/reports")}>
          <h3>View Reports</h3>
          <p>See all user-submitted reports</p>
        </div>

        <div className="admin-card" onClick={() => navigate("/admin/users")}>
          <h3>Manage Users</h3>
          <p>Block / Unblock Patients & Doctors</p>
        </div>

      </div>
    </div>
  );
}
