// backend/routes/doctorRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

// ---- Allowed Degrees ----
const allowedDegrees = [
  "MBBS",
  "BAMS",
  "BHMS",
  "BUMS",
  "BSMS",
  "BNYS",
  "BDS"
];

// ---- Degree → Specialization Map ----
const specializationMap = {
  MBBS: [
    "General Medicine", "General Surgery", "Pediatrics", "Obstetrics & Gynecology",
    "Orthopedics", "Dermatology", "Ophthalmology", "ENT", "Psychiatry",
    "Anesthesiology", "Radiology", "Pathology", "Community Medicine",
    "Family Medicine", "Emergency Medicine", "Cardiology", "Neurology",
    "Nephrology", "Gastroenterology", "Endocrinology",
    "Pulmonology", "Hepatology", "Oncology",
    "Plastic Surgery", "Neurosurgery", "Urology"
  ],

  BAMS: ["Kayachikitsa", "Panchakarma", "Shalya Tantra", "Shalakya Tantra"],
  BHMS: ["Homeopathic Repertory", "Materia Medica", "Organon of Medicine"],
  BUMS: ["Ilmul Advia", "Ilmul Amraz", "Moalijat"],
  BSMS: ["Siddha General Medicine", "Siddha Pharmacology"],
  BNYS: ["Yoga Therapy", "Naturopathy Medicine"],
  BDS: [
    "Oral Medicine & Radiology", "Oral & Maxillofacial Surgery",
    "Orthodontics", "Periodontology", "Prosthodontics",
    "Pedodontics", "Endodontics"
  ]
};

// ================================
//          REGISTER
// ================================
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, specialization, hospital, password, degree } = req.body;

    if (!fullName || !email || !password || !degree || !specialization) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate degree
    if (!allowedDegrees.includes(degree)) {
      return res.status(400).json({ message: "Invalid medical degree" });
    }

    // Validate specialization belongs to degree
    if (!specializationMap[degree].includes(specialization)) {
      return res.status(400).json({
        message: `Specialization '${specialization}' is not valid for degree '${degree}'`
      });
    }

    // Check existing email
    const existing = await Doctor.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      fullName,
      email,
      specialization,
      hospital: hospital || null,
      password: hashed,
      degree
    });

    return res.status(201).json({
      message: "Doctor registered successfully",
      doctorId: doctor.id
    });

  } catch (err) {
    console.error("Doctor register error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
//          LOGIN
// ================================
// Doctor login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // 🚨 Block protection
    if (doctor.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked by admin." });
    }

    const ok = await bcrypt.compare(password, doctor.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: doctor.id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token, doctorId: doctor.id });

  } catch (err) {
    console.error("Doctor login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ================================
//   SUBMIT REGISTRATION NUMBER
// ================================
router.post("/submit-reg", authMiddleware(["doctor"]), async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    if (!registrationNumber) {
      return res.status(400).json({ message: "Registration number required" });
    }

    const doctor = await Doctor.findByPk(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.regVerified === true) {
      return res.status(400).json({ message: "Already verified" });
    }

    // Hash reg number so we never store it
    const hashedReg = await bcrypt.hash(registrationNumber, 10);

    doctor.registrationNumberHashed = hashedReg;
    await doctor.save();

    return res.json({ message: "Registration number submitted successfully" });

  } catch (err) {
    console.error("Submit reg no error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
//  CHECK VERIFICATION STATUS
// ================================
router.get("/verify-status", authMiddleware(["doctor"]), async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      regVerified: doctor.regVerified
    });

  } catch (err) {
    console.error("Verification check error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
