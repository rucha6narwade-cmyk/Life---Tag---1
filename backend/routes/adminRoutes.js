const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { Admin, Patient, Doctor, Report } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

require("dotenv").config();

const router = express.Router();

// ================================
//  ADMIN GET SUMMARY STATISTICS
// ================================
router.get("/summary", authMiddleware(["admin"]), async (req, res) => {
  try {
    const patientCount = await Patient.count();
    const doctorCount = await Doctor.count();
    const reportCount = await Report.count();
    const blockedPatients = await Patient.count({ where: { isBlocked: true } });
    const blockedDoctors = await Doctor.count({ where: { isBlocked: true } });
    const blockedCount = blockedPatients + blockedDoctors;

    return res.json({
      patients: patientCount,
      doctors: doctorCount,
      reports: reportCount,
      blocked: blockedCount
    });
  } catch (err) {
    console.error("Fetch summary error:", err);
    return res.status(500).json({ message: "Internal Error" });
  }
});

// ================================
//  ADMIN GET ALL USERS (Patients or Doctors)
// ================================
router.get("/users", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { role } = req.query;

    if (!role || !["patient", "doctor"].includes(role)) {
      return res.status(400).json({ message: "Invalid or missing role parameter" });
    }

    let users = [];
    if (role === "patient") {
      users = await Patient.findAll({
        attributes: { exclude: ["password"] }
      });
    } else if (role === "doctor") {
      users = await Doctor.findAll({
        attributes: { exclude: ["password", "registrationNumberHashed"] }
      });
    }

    res.json({ users });
  } catch (err) {
    console.error("Fetch users error:", err);
    return res.status(500).json({ message: "Internal Error" });
  }
});

// ================================
//  ADMIN VIEW ALL REPORTS
// ================================
router.get("/reports", authMiddleware(["admin"]), async (req, res) => {
  try {
    const reports = await Report.findAll();
    return res.json({ reports });
  } catch (err) {
    console.error("Fetch reports error:", err);
    return res.status(500).json({ message: "Internal Error" });
  }
});


// ================================
//  ADMIN BLOCK A USER
// ================================
router.post("/block", authMiddleware(["admin"]), async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    if (role === "patient") {
      await Patient.update({ isBlocked: true }, { where: { id: userId } });
    } else if (role === "doctor") {
      await Doctor.update({ isBlocked: true }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: "Role not supported" });
    }

    return res.json({ message: `${role} blocked successfully` });
  } catch (err) {
    console.error("Block error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
//  ADMIN UNBLOCK A USER
// ================================
router.post("/unblock", authMiddleware(["admin"]), async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    if (role === "patient") {
      await Patient.update({ isBlocked: false }, { where: { id: userId } });
    } else if (role === "doctor") {
      await Doctor.update({ isBlocked: false }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: "Role not supported" });
    }

    return res.json({ message: `${role} unblocked successfully` });
  } catch (err) {
    console.error("Unblock error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
// ADMIN SEARCH USERS
router.get("/search", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.json({ results: [] });

    const patients = await Patient.findAll({
      where: {
        [Op.or]: [
          { id: query },
          { email: query },
          { fullName: { [Op.iLike]: `%${query}%` } }
        ]
      }
    });

    const doctors = await Doctor.findAll({
      where: {
        [Op.or]: [
          { id: query },
          { email: query },
          { fullName: { [Op.iLike]: `%${query}%` } }
        ]
      }
    });

    res.json({ results: [...patients, ...doctors] });
  } catch (err) {
    console.error("search error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// ADMIN GET FULL USER PROFILE
router.get("/user", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { id, role } = req.query;

    if (!id || !role)
      return res.status(400).json({ message: "Missing parameters" });

    let user =
      role === "patient"
        ? await Patient.findByPk(id)
        : role === "doctor"
        ? await Doctor.findByPk(id)
        : null;

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ message: "Internal Error" });
  }
});

// ================================
//  VERIFY USER (doctor -> regVerified, patient -> aadhaarVerified)
// ================================
router.post('/verify-user', authMiddleware(['admin']), async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'Missing parameters' });

    if (role === 'doctor') {
      await Doctor.update({ regVerified: true }, { where: { id: userId } });
    } else if (role === 'patient') {
      await Patient.update({ aadhaarVerified: true }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: 'Unsupported role' });
    }

    return res.json({ message: 'User verified successfully' });
  } catch (err) {
    console.error('Verify user error:', err);
    return res.status(500).json({ message: 'Internal Error' });
  }
});

// ================================
//  SUSPEND USER (isBlocked = true)
// ================================
router.post('/suspend', authMiddleware(['admin']), async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'Missing parameters' });

    if (role === 'patient') {
      await Patient.update({ isBlocked: true }, { where: { id: userId } });
    } else if (role === 'doctor') {
      await Doctor.update({ isBlocked: true }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: 'Unsupported role' });
    }

    return res.json({ message: 'User suspended successfully' });
  } catch (err) {
    console.error('Suspend user error:', err);
    return res.status(500).json({ message: 'Internal Error' });
  }
});

// ================================
//  UNSUSPEND USER (isBlocked = false)
// ================================
router.post('/unsuspend', authMiddleware(['admin']), async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'Missing parameters' });

    if (role === 'patient') {
      await Patient.update({ isBlocked: false }, { where: { id: userId } });
    } else if (role === 'doctor') {
      await Doctor.update({ isBlocked: false }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: 'Unsupported role' });
    }

    return res.json({ message: 'User unsuspended successfully' });
  } catch (err) {
    console.error('Unsuspend user error:', err);
    return res.status(500).json({ message: 'Internal Error' });
  }
});



module.exports = router;
