const express = require("express");
const router = express.Router();
const Tutor = require("../models/Tutor");

// Endpoint to get all tutor emails
router.get("/", async (req, res) => {
  try {
    const tutors = await Tutor.find();
    res.status(200).json(tutors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutors", error });
  }
});

module.exports = router;
