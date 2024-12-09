const express = require("express");
const multer = require("multer");
const Message = require("../models/UserMessage");
const Course = require("../models/Course"); // Assuming you have a Course model
const nodemailer = require("nodemailer");

const router = express.Router();

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
router.get("/messages", async (req, res) => {
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
router.get("/messagestutor", async (req, res) => {
  try {
    // Extract tutor email from query, body, or headers (depending on method used)
    const tutorEmail =
      req.query.tutoremail ||
      req.body.tutoremail ||
      req.headers.authorization?.split(" ")[1];

    console.log("Received tutor email:", tutorEmail); // Log the email being received

    if (!tutorEmail) {
      console.log("Tutor email is missing.");
      return res.status(400).json({ message: "Tutor email is required." });
    }

    // Log message querying process
    console.log("Querying messages for tutor with email:", tutorEmail);

    // Fetch messages where the tutorEmail matches in the courseName
    const messages = await Message.find({
      "courseName.tutorEmail": tutorEmail,
    })
      .populate("userId", "name email") // Include user details in the result
      .select("courseName date userMessage replies"); // Select the required fields

    // Log the fetched messages
    console.log("Fetched messages:", messages);

    if (messages.length === 0) {
      console.log("No messages found for this tutor.");
      return res
        .status(404)
        .json({ message: "No messages found for this tutor." });
    }

    // If there are messages, log the successful response
    console.log("Messages found, sending response.");
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error); // Log the error if any
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

// ** PATCH /messages/:id/reply **: Add a reply to a message
router.patch("/messages/:id/reply", async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ message: "Reply content is required." });
  }

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { $push: { replies: reply } },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found." });
    }

    res
      .status(200)
      .json({ message: "Reply added successfully!", updatedMessage });
  } catch (error) {
    console.error("Error updating reply:", error);
    res.status(500).json({ message: "Failed to add reply." });
  }
});

// ** POST /messages **: Submit a new message
router.post("/", upload.single("file"), async (req, res) => {
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
