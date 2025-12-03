// src/components/PrivateAdmin.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const PrivateAdmin = ({ children }) => {
  const { auth } = useAuth();

  // No auth loaded or not logged in
  if (!auth) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but NOT admin
  if (auth.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin authenticated
  return <>{children}</>;
};

export default PrivateAdmin;
