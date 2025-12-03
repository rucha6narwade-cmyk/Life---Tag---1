import React, { useEffect, useState } from "react";
import apiClient from "../../api";
import "./AdminDashboard.css";

export default function AdminReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    apiClient.get("/admin/reports").then((res) => {
      setReports(res.data.reports);
    });
  }, []);

  return (
    <div className="admin-page">
      <h1 className="admin-title">User Reports</h1>

      <div className="report-table">
        <table>
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Role</th>
              <th>Reported User</th>
              <th>User Role</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.reporterId}</td>
                <td>{r.reporterRole}</td>
                <td>{r.reportedUserId}</td>
                <td>{r.reportedUserRole}</td>
                <td>{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
