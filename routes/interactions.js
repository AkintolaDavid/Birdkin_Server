const express = require("express");
const multer = require("multer");
const Message = require("../models/UserMessage");
const Course = require("../models/Course"); // Assuming you have a Course model
const nodemailer = require("nodemailer");

const router = express.Router();
const verifyUserToken = require("../middleware/verifyUserToken");
// Multer configuration for file uploads
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

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ** GET /messages **: Fetch messages for a specific user
router.get("/messages", verifyUserToken, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const messages = await Message.find({ userId })
      .populate("userId", "name email") // Optional: Include user details
      .select("courseName date userMessage replies");
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

router.get("/messagestutor", verifyUserToken, async (req, res) => {
  try {
    let tutorEmail = req.query.tutoremail;

    if (!tutorEmail) {
      return res.status(400).json({ message: "Tutor email is required." });
    }

    tutorEmail = tutorEmail.replace(/\s+/g, ""); // Remove any spaces from email

    console.log("Received tutor email after cleaning:", tutorEmail);

    // Query to find the course based on the tutor's email
    const course = await Course.findOne({
      email: { $in: [tutorEmail] }, // Match any email in the array
    });

    // Log the entire course object to understand its structure
    console.log("Found course object:", course);

    if (!course) {
      return res
        .status(404)
        .json({ message: "No course found for this tutor." });
    }

    console.log("Found course for tutor:", course.title); // Log the found course title

    // Fetch the messages for the course name
    const messages = await Message.find({
      courseName: course.title, // Use the course title to find related messages
    })
      .populate("userId", "name email") // Include user details in the result
      .select("courseName date userMessage replies"); // Select the required fields

    if (messages.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found for this tutor." });
    }

    res.status(200).json(messages); // Return the found messages
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

// ** PATCH /messages/:id/reply **: Add a reply to a message
router.patch("/messages/:id/reply", verifyUserToken, async (req, res) => {
  const { id } = req.params;
  const { reply, replyType } = req.body;

  if (!reply || !replyType) {
    return res
      .status(400)
      .json({ message: "Reply and replyType are required." });
  }

  try {
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (!Array.isArray(message.replies)) {
      message.replies = []; // Initialize replies as an array
    }

    message.replies.push({ content: reply, type: replyType });
    await message.save();

    res.status(200).json({
      message: "Reply added successfully!",
      updatedMessage: message,
    });
  } catch (error) {
    console.error("Error updating reply:", error);
    res.status(500).json({ message: "Failed to add reply." });
  }
});

// ** POST /messages **: Submit a new message
router.post("/", verifyUserToken, upload.single("file"), async (req, res) => {
  const { message, courseName, date, time, userId } = req.body;

  if (!message || !courseName || !date || !time || !userId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const course = await Course.findOne({ title: courseName });

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const tutorEmails = course.email;

    if (!tutorEmails || tutorEmails.length === 0) {
      return res
        .status(400)
        .json({ message: "No tutors found for this course." });
    }

    const interactionData = {
      courseName,
      userMessage: message,
      date,
      time,
      userId,
      fileUrl: req.file ? req.file.path : null,
    };

    const savedMessage = await Message.create(interactionData);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: tutorEmails,
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
