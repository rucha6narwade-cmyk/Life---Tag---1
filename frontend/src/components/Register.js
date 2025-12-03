// src/components/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import './Register.css';

const degrees = [
  "MBBS",
  "BAMS",
  "BHMS",
  "BUMS",
  "BSMS",
  "BNYS",
  "BDS"
];

const specializationMap = {
  MBBS: [
    "General Medicine", "General Surgery", "Pediatrics", "Obstetrics & Gynecology",
    "Orthopedics", "Dermatology", "Ophthalmology", "ENT", "Psychiatry",
    "Anesthesiology", "Radiology", "Pathology", "Community Medicine",
    "Family Medicine", "Emergency Medicine", "Physical Medicine & Rehabilitation",
    "Cardiology", "Neurology", "Nephrology", "Gastroenterology", "Endocrinology",
    "Clinical Hematology", "Medical Oncology", "Rheumatology",
    "Infectious Diseases", "Pulmonology", "Hepatology",
    "Neurosurgery", "Plastic Surgery", "Cardiothoracic Surgery",
    "Pediatric Surgery", "Urology", "Surgical Oncology", "Vascular Surgery"
  ],

  BAMS: ["Kayachikitsa", "Panchakarma", "Shalya Tantra", "Shalakya Tantra", "Prasuti & Stri Roga (Ayurveda)", "Kaumarbhritya"],

  BHMS: ["Homeopathic Repertory", "Homeopathic Materia Medica", "Organon of Medicine"],

  BUMS: ["Ilmul Advia", "Ilmul Amraz", "Moalijat"],

  BSMS: ["Siddha General Medicine", "Siddha Pharmacology"],

  BNYS: ["Yoga Therapy", "Naturopathy Medicine"],

  BDS: [
    "Oral Medicine & Radiology", "Oral & Maxillofacial Surgery", "Orthodontics",
    "Periodontology", "Prosthodontics", "Pedodontics",
    "Conservative Dentistry & Endodontics", "Public Health Dentistry"
  ]
};

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    specialization: '',
    hospital: '',
    degree: '',
    aadhaar: ''
  });

  // Aadhaar OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- Aadhaar prototype OTP ---
  const sendOtp = () => {
    if (!formData.aadhaar || formData.aadhaar.length !== 12) {
      return setError("Enter a valid 12-digit Aadhaar number.");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    alert(`Prototype OTP: ${otp}`); // visible for prototype
  };

  const verifyOtp = () => {
    if (otpInput === generatedOtp) {
      setAadhaarVerified(true);
      setOtpSent(false);
      setError(null);
    } else {
      setError("Invalid OTP. Try again.");
    }
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prevent patient registration unless Aadhaar is verified
    if (role === "patient" && !aadhaarVerified) {
      setLoading(false);
      return setError("Please verify your Aadhaar before registering.");
    }

    let url = role === 'patient' ? '/users/register' : '/doctors/register';

    let data =
      role === 'patient'
        ? {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            age: formData.age || undefined,
            gender: formData.gender || undefined,
          }
        : {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            specialization: formData.specialization,
            hospital: formData.hospital || undefined,
            degree: formData.degree,
          };

    try {
      await apiClient.post(url, data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">

        <h2 className="title">Create Your Account</h2>

        {/* Role Toggle */}
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

          <label>Full Name</label>
          <input type="text" name="fullName" className="modern-input" required onChange={handleChange} />

          <label>Email</label>
          <input type="email" name="email" className="modern-input" required onChange={handleChange} />

          <label>Password</label>
          <input type="password" name="password" className="modern-input" required onChange={handleChange} />

          {/* ---------- PATIENT SECTION ---------- */}
          {role === 'patient' && (
            <>
              {/* Aadhaar */}
              <label>Aadhaar Number</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  name="aadhaar"
                  className="modern-input"
                  maxLength="12"
                  disabled={aadhaarVerified}
                  value={formData.aadhaar}
                  onChange={(e) =>
                    setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, "") })
                  }
                  required
                />

                {!aadhaarVerified && (
                  <button type="button" className="primary-button glossy-btn" onClick={sendOtp}>
                    Send OTP
                  </button>
                )}
              </div>

              {otpSent && !aadhaarVerified && (
                <>
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    className="modern-input"
                    maxLength="6"
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  />

                  <button type="button" className="primary-button glossy-btn" onClick={verifyOtp}>
                    Verify OTP
                  </button>
                </>
              )}

              {aadhaarVerified && (
                <p style={{ color: "green", fontWeight: "600" }}>✔ Aadhaar Verified</p>
              )}

              {/* Basic fields */}
              <label>Age (Optional)</label>
              <input type="number" name="age" className="modern-input" onChange={handleChange} />

              <label>Gender (Optional)</label>
              <input type="text" name="gender" className="modern-input" onChange={handleChange} />
            </>
          )}

          {/* ---------- DOCTOR SECTION ---------- */}
          {role === 'doctor' && (
            <>
              <label>Medical Degree</label>
              <select
                name="degree"
                className="modern-input"
                required
                value={formData.degree}
                onChange={handleChange}
              >
                <option value="">Select Degree</option>
                {degrees.map((deg) => (
                  <option key={deg} value={deg}>{deg}</option>
                ))}
              </select>

              <label>Specialization</label>
              <select
                name="specialization"
                className="modern-input"
                required
                value={formData.specialization}
                onChange={handleChange}
                disabled={!formData.degree}
              >
                <option value="">Select Specialization</option>

                {formData.degree &&
                  specializationMap[formData.degree].map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
              </select>

              <label>Hospital (Optional)</label>
              <input
                type="text"
                name="hospital"
                className="modern-input"
                onChange={handleChange}
              />
            </>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-button glossy-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="footer-text">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
