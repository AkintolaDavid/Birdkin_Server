const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Message = require("../models/UserMessage");
const Course = require("../models/Course"); // Assuming you have a Course model

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
    }
  },
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("userId", "name email") // Populate user details (optional)
      .select("courseName date userMessage"); // Only include specific fields

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  const { message, courseName, date, time, userId } = req.body;

  // Validate required fields
  if (!message || !courseName || !date || !time) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Find the course by name and get its tutors' emails
    const course = await Course.findOne({ title: courseName });

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const tutorEmails = course.email; // Assuming `email` is an array of tutor emails

    if (!tutorEmails || tutorEmails.length === 0) {
      return res
        .status(400)
        .json({ message: "No tutors found for this course." });
    }

    // Construct interaction data
    const interactionData = {
      courseName,
      userMessage: message,
      date,
      time,
      userId,
      fileUrl: req.file ? req.file.path : null, // Save relative path for file
    };

    // Save to MongoDB
    const savedMessage = await Message.create(interactionData);

    // Send email to tutors
    const mailOptions = {
      from: "your-email@example.com", // Your email
      to: tutorEmails, // Send to all tutor emails
      subject: `New Message for Course: ${courseName}`,
      text: `A student has sent the following message:\n\n${message}\n\nDate: ${date}\nTime: ${time}`,
      attachments: req.file
        ? [
            {
              filename: req.file.originalname,
              path: req.file.path,
            },
          ]
        : [],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Interaction submitted and emails sent successfully!",
      savedMessage,
    });
  } catch (error) {
    console.error("Error saving interaction or sending emails:", error);
    res
      .status(500)
      .json({ message: "Failed to save interaction or send emails." });
  }
});

module.exports = router;
