import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-wrapper">
      <div className="welcome-card">
        <div className="logo">LT</div>

        <h1 className="welcome-title">Welcome to LifeTag</h1>
        <p className="welcome-sub">
          Secure, decentralized health records — accessible anytime, anywhere.
        </p>

        <div className="welcome-buttons">
          <Link to="/login" className="primary-button login-btn">
            Login
          </Link>

          <Link to="/register" className="primary-button register-btn">
            Register
          </Link>
        </div>

        <p className="small">By continuing you agree to our <Link to="/terms">Terms</Link></p>
      </div>
    </div>
  );
};

export default Welcome;
