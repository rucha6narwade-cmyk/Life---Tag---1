// src/components/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useAuth } from './context/AuthContext';
import './Login.css'; // <-- NEW

const Login = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let roleUrl = '';
    let redirectPath = '';

    if (role === 'patient') {
      roleUrl = '/users/login';
      redirectPath = '/dashboard';
    } else if (role === 'doctor') {
      roleUrl = '/doctors/login';
      redirectPath = '/dashboard';
    }

    try {
      const response = await apiClient.post(roleUrl, formData);
      const { token, patientId, doctorId, adminId, patientTagId } = response.data;
      let internalId = '';
      let tagId = null;
      let finalRole = role;
      let finalRedirect = redirectPath;

      if (role === 'patient') {
        internalId = patientId;
        tagId = patientTagId;
      } else if (role === 'doctor') {
        internalId = doctorId;
      }

      // Check if response contains adminId (hardcoded admin login via /users/login)
      if (response.data.adminId !== undefined) {
        finalRole = 'admin';
        internalId = adminId;
        finalRedirect = '/admin/dashboard';
      }

      login(token, finalRole, internalId, tagId);
      navigate(finalRedirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h2 className="title">Login to Your Account</h2>

        {/* Role Selector - 2 options: Patient & Doctor */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'patient' ? 'role-btn-active' : ''}`}
            onClick={() => setRole('patient')}
          >
            Patient
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'doctor' ? 'role-btn-active' : ''}`}
            onClick={() => setRole('doctor')}
          >
            Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">

          <label>Email</label>
          <input
            type="email"
            name="email"
            className="modern-input"
            placeholder="john@example.com"
            required
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            className="modern-input"
            placeholder="Your password"
            required
            onChange={handleChange}
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-button glossy-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="footer-text">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
