const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const nodemailer = require("nodemailer");

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    // Log the received `id` from the URL
    console.log("Received ID:", req.params.id);

    // Find the course by the received `id`
    const course = await Course.findOne({ id: req.params.id });

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    // Return the course details
    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Error fetching course", error });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail", // Change if you're not using Gmail
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
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
    // Save the course in the database
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

    // Send email notifications
    const emailPromises = emails.map((email) => {
      return transporter.sendMail({
        from: `"Birdkins Admin" <${process.env.EMAIL}>`, // Sender address
        to: email, // Recipient address
        subject: "New Course Assignment Notification", // Subject
        text: `Hello, you have been added as a tutor for the course "${title}" by Birdkins Admin.`, // Plain text body
        html: `<p>Hello,</p>
               <p>You have been added as a tutor for the course <strong>${title}</strong> by Birdkins Admin.</p>`, // HTML body
      });
    });

    await Promise.all(emailPromises);

    res.status(201).json({ message: "Course created successfully!" });
  } catch (error) {
    console.error("Error saving course or sending emails:", error);
    res
      .status(500)
      .json({ message: "Failed to create course or send emails." });
  }
});

module.exports = router;
