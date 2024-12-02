const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    school: {
      type: String,
      required: true,
      trim: true,
    },
    firstSubject: {
      type: String,
      required: true,
      trim: true,
    },
    specificHelp: {
      type: String,
      required: true,
      trim: true,
    },
    secondSubject: {
      type: String,
      trim: true, // Optional field, no "required" rule
    },
    intendedUniversity: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    otp: {
      type: String,
      required: true,
    },
    otpExpiration: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
