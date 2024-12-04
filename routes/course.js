const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});
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
      email: Array.isArray(emails) // Check if emails is already an array
        ? emails.map((email) => email.trim())
        : emails.split(",").map((email) => email.trim()),
      description,
      img,
      category,
      topics: Array.isArray(topics) // Check if topics is already an array
        ? topics.map((topic) => topic.trim())
        : topics.split(",").map((topic) => topic.trim()),
    });

    await course.save();
    res.status(201).json({ message: "Course created successfully!" });
  } catch (error) {
    console.error("Error saving course:", error);
    res.status(500).json({ message: "Failed to create course." });
  }
});

module.exports = router;
