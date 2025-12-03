const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin, Patient, Doctor, Report } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// --- EXISTING REGISTER & LOGIN CODE ---
// (keep your existing admin register/login here)


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
// TEMP admin create for prototype
router.post("/create-super", async (req, res) => {
  try {
    const hashed = await bcrypt.hash("admin123", 10);

    const admin = await Admin.create({
      fullName: "System Admin",
      email: "admin@lifetag.com",
      password: hashed,
      isSuper: true,
    });

    res.json({ message: "Super Admin Created", admin });
  } catch (err) {
    res.status(500).json({ message: "Error creating admin" });
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



module.exports = router;
