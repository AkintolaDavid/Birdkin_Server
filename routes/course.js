const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Get a single course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course", error });
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
      email: Array.isArray(emails)
        ? emails.map((email) => email.trim())
        : emails.split(",").map((email) => email.trim()),
      description,
      img,
      category,
      topics: Array.isArray(topics)
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
