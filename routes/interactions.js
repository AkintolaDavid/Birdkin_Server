const express = require("express");
const multer = require("multer");
const path = require("path");

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
router.post("/", upload.single("file"), (req, res) => {
  const { message, date, time, courseId } = req.body;

  if (!message || !date || !time || !courseId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const interactionData = {
      message,
      date,
      time,
      courseId,
      filePath: req.file ? path.join(__dirname, "../", req.file.path) : null,
    };

    console.log("Interaction received:", interactionData);
    // Save interactionData to the database (MongoDB or another)
    // Example: db.collection("interactions").insertOne(interactionData);

    res.status(201).json({ message: "Interaction submitted successfully!" });
  } catch (error) {
    console.error("Error saving interaction:", error);
    res.status(500).json({ message: "Failed to save interaction." });
  }
});

module.exports = router;
