const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

router.post("/", async (req, res) => {
  const { title, rating, lecturer, email, description, img, category, topics } =
    req.body;

  try {
    const course = new Course({
      title,
      rating,
      lecturer,
      email, // This email will now correspond to the selected tutor
      description,
      img,
      category,
      topics,
    });

    await course.save();
    res.status(201).json({ message: "Course created successfully!" });
  } catch (error) {
    console.error("Error saving course:", error);
    res.status(500).json({ message: "Failed to create course." });
  }
});

module.exports = router;
