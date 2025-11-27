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

    const roleUrl = role === 'patient' ? '/users/login' : '/doctors/login';

    try {
      const response = await apiClient.post(roleUrl, formData);

      const { token, patientId, doctorId, patientTagId } = response.data;
      const internalId = role === 'patient' ? patientId : doctorId;
      const tagId = role === 'patient' ? patientTagId : null;

      login(token, role, internalId, tagId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h2 className="title">Login to Your Account</h2>

        {/* Role Switch */}
        <div className={`form-toggle ${role === 'doctor' ? 'doctor-active' : ''}`}>
          <div className="toggle-text-layer background-text">
            <span>Patient</span>
            <span>Doctor</span>
          </div>

          <div className="sliding-pill">
            <div className="toggle-text-layer foreground-text">
              <span>Patient</span>
              <span>Doctor</span>
            </div>
          </div>

          <div className="toggle-clickable-layer">
            <div onClick={() => setRole('patient')}></div>
            <div onClick={() => setRole('doctor')}></div>
          </div>
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
