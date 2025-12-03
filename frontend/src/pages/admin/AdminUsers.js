
import React, { useEffect, useState } from "react";
import apiClient from "../../api";
import "./AdminDashboard.css";

export default function AdminUsers() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const fetchData = async () => {
    const p = await apiClient.get("/users/all");
    const d = await apiClient.get("/doctors/all");
    setPatients(p.data);
    setDoctors(d.data);
  };

  const toggleBlock = async (id, role, status) => {
    await apiClient.post(`/admin/${status ? "unblock" : "block"}`, {
      userId: id,
      role,
    });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="admin-page">
      <h1 className="admin-title">Manage Users</h1>

      <h2 className="admin-subtitle">Patients</h2>
      <div className="report-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Aadhaar</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.fullName}</td>
                <td>{p.aadhaarVerified ? "Verified" : "Not verified"}</td>
                <td>{p.isBlocked ? "Blocked" : "Active"}</td>
                <td>
                  <button
                    className="primary-button glossy-btn"
                    onClick={() => toggleBlock(p.id, "patient", p.isBlocked)}
                  >
                    {p.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="admin-subtitle">Doctors</h2>
      <div className="report-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Verified</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.fullName}</td>
                <td>{d.regVerified ? "Yes" : "No"}</td>
                <td>{d.isBlocked ? "Blocked" : "Active"}</td>
                <td>
                  <button
                    className="primary-button glossy-btn"
                    onClick={() => toggleBlock(d.id, "doctor", d.isBlocked)}
                  >
                    {d.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
