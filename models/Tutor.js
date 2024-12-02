const mongoose = require("mongoose");

const TutorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  university: { type: String, required: true },
  firstSubject: { type: String, required: true },
  firstgrade: { type: String, required: true },
  secondSubject: { type: String },
  secondgrade: { type: String },
  commitment: { type: String, required: true },
  additionalTutoring: { type: String },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, required: true },
  otpExpiration: { type: Date, required: true },
});

const Tutor = mongoose.model("Tutor", TutorSchema);
module.exports = Tutor;
