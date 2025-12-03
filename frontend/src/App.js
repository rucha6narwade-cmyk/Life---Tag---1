// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminBlockUsers from "./pages/admin/AdminBlockUsers";
import PrivateAdmin from "./components/PrivateAdmin";

// Verification Pages
import VerifyAadhaar from "./pages/VerifyAadhaar";
import VerifyDoctor from "./pages/VerifyDoctor";

// Layouts
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Register from "./components/Register";

// Common Protected Pages
import DashboardWrapper from "./components/DashboardWrapper";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

// Patient Pages
import CloudRecordsPage from "./pages/CloudRecordsPage";
import PatientRequestsPage from "./pages/PatientRequestsPage";
import PatientUploadPage from "./pages/PatientUploadPage";

// Doctor Pages
import DoctorRequestAccessPage from "./pages/DoctorRequestAccessPage";
import DoctorSentRequestsPage from "./pages/DoctorSentRequestsPage";
import DoctorUploadPage from "./pages/DoctorUploadPage";
import DoctorViewRecordsPage from "./pages/DoctorViewRecordsPage";

import "./App.css";
import "./index.css";

function App() {
  const { auth } = useAuth();

  const publicRouteWrapper = (element) => (
    <div className="centered-page-wrapper">{element}</div>
  );

  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={publicRouteWrapper(<Welcome />)} />
        <Route path="/login" element={publicRouteWrapper(<Login />)} />
        <Route path="/register" element={publicRouteWrapper(<Register />)} />

        {/* ---------- ADMIN PUBLIC (LOGIN) ---------- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ---------- ADMIN PROTECTED ROUTES ---------- */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateAdmin>
              <AdminDashboard />
            </PrivateAdmin>
          }
        />

        <Route
          path="/admin/users"
          element={
            <PrivateAdmin>
              <AdminUsers />
            </PrivateAdmin>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <PrivateAdmin>
              <AdminReports />
            </PrivateAdmin>
          }
        />

        <Route
          path="/admin/block-users"
          element={
            <PrivateAdmin>
              <AdminBlockUsers />
            </PrivateAdmin>
          }
        />

        {/* ---------- USER PROTECTED ROUTES ---------- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* Common */}
            <Route path="/dashboard" element={<DashboardWrapper />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Patient Only */}
            {auth?.role === "patient" && (
              <>
                <Route path="/cloud-records" element={<CloudRecordsPage />} />
                <Route path="/my-requests" element={<PatientRequestsPage />} />
                <Route path="/upload" element={<PatientUploadPage />} />
                <Route path="/verify-aadhaar" element={<VerifyAadhaar />} />
              </>
            )}

            {/* Doctor Only */}
            {auth?.role === "doctor" && (
              <>
                <Route path="/request-access" element={<DoctorRequestAccessPage />} />
                <Route path="/sent-requests" element={<DoctorSentRequestsPage />} />
                <Route path="/upload-record" element={<DoctorUploadPage />} />
                <Route path="/view-records" element={<DoctorViewRecordsPage />} />
                <Route path="/verify-doctor" element={<VerifyDoctor />} />
              </>
            )}

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;
