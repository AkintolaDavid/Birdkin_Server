const express = require("express");
const multer = require("multer");
const path = require("path");
const Message = require("../models/UserMessage"); // Adjust the path to where your schema is stored

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

// Handle interaction submissions
router.post("/", upload.single("file"), async (req, res) => {
  const { message, date, time, courseId } = req.body;

  // Validate required fields
  if (!message || !date || !time || !courseId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Build the new message object
    const newMessage = new Message({
      courseId,
      userMessage: message,
      date: new Date(date),
      time,
      fileUrl: req.file ? req.file.path : null,
    });

    // Save the message to the database
    const savedMessage = await newMessage.save();

    res.status(201).json({
      message: "Interaction submitted successfully!",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Error saving interaction:", error);
    res.status(500).json({ message: "Failed to save interaction." });
  }
});

module.exports = router;
