// backend/models/Doctor.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Doctor = sequelize.define(
  "Doctor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    degree: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    hospital: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // 🔒 Doctor Registration Verification
    registrationNumberHashed: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    regVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // 🚨 NEW — Admin can block doctors too
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // Optional — helps your auth system
    role: {
      type: DataTypes.STRING,
      defaultValue: "doctor",
    },
  },
  {
    tableName: "doctors",
    timestamps: true,
  }
);

module.exports = Doctor;
