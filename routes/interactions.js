const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const Message = require("../models/UserMessage"); // Correct import path for your schema

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

router.post("/", upload.single("file"), async (req, res) => {
  const { message, date, time, courseId } = req.body;

  // Validate required fields
  if (!message || !date || !time || !courseId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId format." });
    }

    // Construct interaction data
    const interactionData = {
      courseId: mongoose.Types.ObjectId(courseId), // Convert to ObjectId
      userMessage: message,
      date,
      time,
      fileUrl: req.file ? req.file.path : null, // Save relative path
    };

    // Save to MongoDB
    const savedMessage = await Message.create(interactionData);

    res.status(201).json({
      message: "Interaction submitted successfully!",
      savedMessage,
    });
  } catch (error) {
    console.error("Error saving interaction:", error);
    res.status(500).json({ message: "Failed to save interaction." });
  }
});

module.exports = router;
