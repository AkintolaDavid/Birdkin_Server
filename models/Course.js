const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // Use String for a UUID or timestamp
  title: { type: String, required: true },
  rating: { type: Number, required: true },
  lecturer: { type: String, required: true },
  email: [{ type: String, required: true }],
  description: String,
  img: String,
  category: String,
  topics: [{ type: String }],
});

module.exports = mongoose.model("Course", CourseSchema);
