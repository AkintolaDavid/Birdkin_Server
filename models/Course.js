const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rating: { type: Number, required: true },
  lecturer: { type: String, required: true },
  email: [{ type: String, required: true }], // Array of emails
  description: String,
  img: String,
  category: String,
  topics: [{ type: String }], // Array of topics
});

module.exports = mongoose.model("Course", CourseSchema);
