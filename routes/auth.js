const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tutor = require("../models/Tutor");
const nodemailer = require("nodemailer");

const generateOtp = require("../utils/generateOtp"); // Ensure correct path
const sendOtp = require("../utils/sendOtp"); // Ensure correct path
require("dotenv").config();

const router = express.Router();

// Sign Up Route
router.post("/signup", async (req, res) => {
  const {
    fullName,
    email,
    school,
    firstSubject,
    specificHelp,
    secondSubject,
    intendedUniversity,
    password,
  } = req.body;

  try {
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const otp = generateOtp();
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user with OTP information
    const newUser = new User({
      fullName,
      email,
      school,
      firstSubject,
      specificHelp,
      secondSubject,
      intendedUniversity,
      password: hashedPassword,
      otp,
      otpExpiration,
    });

    await newUser.save();

    // Send OTP to the user's email
    await sendOtp(email, otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/signupTutor", async (req, res) => {
  const {
    fullName,
    email,
    university,
    firstSubject,
    firstgrade,
    secondSubject,
    secondgrade,
    commitment,
    additionalTutoring,

    confirmPassword,
    password,
  } = req.body;

  try {
    // Validation checks
    if (
      !fullName ||
      !email ||
      !password ||
      !university ||
      !firstSubject ||
      !firstgrade ||
      !commitment ||
      !secondSubject ||
      !secondgrade ||
      !additionalTutoring
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    const existingEmail = await Tutor.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOtp();
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    // Save the Tutor
    const newTutor = new Tutor({
      fullName,
      email,
      university,
      firstSubject,
      firstgrade,
      secondSubject,
      secondgrade,
      commitment,
      additionalTutoring,

      password: hashedPassword,
      otp,
      otpExpiration,
    });

    await newTutor.save();

    // Send OTP
    await sendOtp(email, otp);

    res
      .status(200)
      .json({ message: "Tutor registered successfully. OTP sent to email." });
  } catch (error) {
    console.error("Error in signupTutor:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
// OTP Verification Route
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is correct and not expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (new Date() > user.otpExpiration) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid, generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    // Mark the user as verified and clear OTP data
    user.isVerified = true;

    // Save updated user
    await user.save();

    res.status(200).json({ message: "OTP verified", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-otptutor", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await Tutor.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is correct and not expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (new Date() > user.otpExpiration) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid, generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    // Mark the user as verified and clear OTP data
    user.isVerified = true;

    // Save updated user
    await user.save();

    res.status(200).json({ message: "OTP verified", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Sign In Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Account not verified. Use forget passward to verify",
      });
    }
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: "user",
    };

    // Generate the JWT
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "3h", // Token valid for 1 hour
    });

    // Return success response
    res.status(200).json({
      message: "Sign in successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: tokenPayload.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/logintutor", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const tutor = await Tutor.findOne({ email });
    if (!tutor) {
      return res.status(404).json({ message: "Email is not registered" });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, tutor.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // Check if the tutor is verified
    if (!tutor.isVerified) {
      return res.status(400).json({
        message: "Account not verified. Use forget passward to verify",
      });
    }

    const tokenPayload = {
      id: tutor._id,
      email: tutor.email,
      role: "user", // Assign user role here
    };

    // Generate the JWT
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "3h", // Token valid for 1 hour
    });
    console.log(token);
    // Return success response
    res.status(200).json({
      message: "Sign in successful",
      token,
      tutor: {
        id: tutor._id,
        email: tutor.email,
        fullName: tutor.fullName,
        role: tokenPayload.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP and expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

    // Update user with OTP and expiration
    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    // Send OTP via email (configure nodemailer correctly)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

router.post("/send-otptutor", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Tutor.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP and expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

    // Update user with OTP and expiration
    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    // Send OTP via email (configure nodemailer correctly)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

router.post("/verifyOtp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the provided OTP matches the user's OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if the OTP is expired
    if (new Date() > user.otpExpiration) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // OTP is valid; generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3h", // Token validity
    });

    // Update user: mark as verified and clear OTP fields
    user.isVerified = true;

    await user.save();

    // Respond with a success message and token
    res.status(200).json({
      message: "OTP verified successfully.",
      token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/verifyOtpTutor", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    // Find user by email
    const tutor = await Tutor.findOne({ email });

    if (!tutor) {
      return res.status(404).json({ message: "tutor not found." });
    }

    // Check if the provided OTP matches the tutor's OTP
    if (tutor.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if the OTP is expired
    if (new Date() > tutor.otpExpiration) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // OTP is valid; generate JWT token
    const token = jwt.sign({ tutorId: tutor._id }, process.env.JWT_SECRET, {
      expiresIn: "3h", // Token validity
    });

    // Update tutor: mark as verified and clear OTP fields
    tutor.isVerified = true;

    await tutor.save();

    // Respond with a success message and token
    res.status(200).json({
      message: "OTP verified successfully.",
      token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error." });
  }
});
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Respond with success
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});
router.post("/reset-passwordtutor", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await Tutor.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Respond with success
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});
module.exports = router;
