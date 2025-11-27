const express = require("express");
const router = express.Router();   // ← REQUIRED





router.post("/register", async (req, res) => {
  try {
    const { fullName, email, specialization, hospital, password, degree } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !password || !degree || !specialization) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. Validate degree (ONLY real primary medical degrees)
    const allowedDegrees = [
      "MBBS",   // Modern medicine
      "BAMS",   // Ayurveda
      "BHMS",   // Homeopathy
      "BUMS",   // Unani
      "BSMS",   // Siddha
      "BNYS",   // Naturopathy
      "BDS"     // Dental
    ];

    if (!allowedDegrees.includes(degree)) {
      return res.status(400).json({ message: "Invalid medical degree" });
    }

    // 3. Validate specialization based on degree
    if (!specializationMap[degree].includes(specialization)) {
      return res.status(400).json({
        message: `Specialization '${specialization}' is not valid for degree '${degree}'`
      });
    }

    // 4. Check duplicate email
    const existing = await Doctor.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 5. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 6. Create doctor entry including degree + validated specialization
    const doctor = await Doctor.create({
      fullName,
      email,
      specialization,
      hospital: hospital || null,
      password: hashed,
      degree
    });

    res.status(201).json({
      message: "Doctor registered successfully",
      doctorId: doctor.id
    });

  } catch (err) {
    console.error("Doctor register error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
