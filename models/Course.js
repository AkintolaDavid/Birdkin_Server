const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  lecturer: {
    type: String,
    required: true,
  },
  email: {
    type: [String], // Store multiple tutor emails as an array of strings
    required: true,
  },
  description: {
    type: String,
  },
  img: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  topics: {
    type: [String], // Store topics as an array of strings
    required: true,
  },
});

module.exports = mongoose.model("Course", CourseSchema);
