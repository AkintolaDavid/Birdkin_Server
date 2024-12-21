const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const nodemailer = require("nodemailer");
const verifyTokenForAdminOrUser = require("../middleware/verifyTokenForAdminOrUser");
const verifyUserToken = require("../middleware/verifyUserToken");
const verifyAdminToken = require("../middleware/verifyAdminToken ");

// Get all courses
router.get("/", verifyTokenForAdminOrUser, async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "failed to fetch courses" });
  }
});
router.get("/:id", verifyUserToken, async (req, res) => {
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
router.delete("/:id", verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: "Course deleted successfully." });
  } catch (error) {
    console.error("Error deleting Course:", error);
    res.status(500).json({ error: "Failed to delete Course." });
  }
});
const transporter = nodemailer.createTransport({
  service: "gmail", // Change if you're not using Gmail
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});
// Create a new course
router.post("/", verifyAdminToken, async (req, res) => {
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

  if (
    !title ||
    !rating ||
    !lecturer ||
    !emails ||
    !category ||
    !topics ||
    !img
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled!" });
  }

  // Validate emails input
  if (!Array.isArray(emails) && typeof emails !== "string") {
    return res.status(400).json({
      message: "Emails must be an array or a comma-separated string!",
    });
  }

  try {
    // Normalize emails to always be an array
    const normalizedEmails = Array.isArray(emails)
      ? emails.map((email) => email.trim())
      : typeof emails === "string"
      ? emails.split(",").map((email) => email.trim())
      : [];

    // Save the course in the database
    const course = new Course({
      title,
      rating,
      lecturer,
      email: normalizedEmails,
      description,
      img,
      category,
      topics: Array.isArray(topics)
        ? topics.map((topic) => topic.trim())
        : topics.split(",").map((topic) => topic.trim()),
    });

    await course.save();

    // Send email notifications
    const emailPromises = normalizedEmails.map((email) => {
      return transporter.sendMail({
        from: `"Birdkins Admin" <${process.env.OWNER_EMAIL}>`, // Sender address
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
