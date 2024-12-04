const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// Create a new course
router.post("/", async (req, res) => {
  const {
    title,
    rating,
    lecturer,
    emails,
    description,
    img,
    category,
    topics,
  } = req.body;

  if (!title || !rating || !lecturer || !emails || !category || !topics) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled!" });
  }

  try {
    const course = new Course({
      title,
      rating,
      lecturer,
      email: emails.split(",").map((email) => email.trim()), // Convert comma-separated string to array
      description,
      img,
      category,
      topics: topics.split(",").map((topic) => topic.trim()), // Convert comma-separated string to array
    });

    await course.save();
    res.status(201).json({ message: "Course created successfully!" });
  } catch (error) {
    console.error("Error saving course:", error);
    res.status(500).json({ message: "Failed to create course." });
  }
});

module.exports = router;
