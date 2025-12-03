const sequelize = require("./db");
const Patient = require("./Patient");
const Doctor = require("./Doctor");
const MedicalRecord = require("./MedicalRecord");
const AccessRequest = require("./AccessRequest");
const Admin = require("./Admin");
const Report = require("./Report");


// Associations

Doctor.hasMany(MedicalRecord, { foreignKey: "doctorId" });
MedicalRecord.belongsTo(Doctor, { foreignKey: "doctorId" });

Patient.hasMany(MedicalRecord, { foreignKey: "patientId" });
MedicalRecord.belongsTo(Patient, { foreignKey: "patientId" });

Doctor.hasMany(AccessRequest, { foreignKey: "doctorId" });
AccessRequest.belongsTo(Doctor, { foreignKey: "doctorId" });

Patient.hasMany(AccessRequest, { foreignKey: "patientId" });
AccessRequest.belongsTo(Patient, { foreignKey: "patientId" });

module.exports = {
  sequelize,
  Patient,
  Doctor,
  MedicalRecord,
  AccessRequest,
  Admin,
  Report,
};
