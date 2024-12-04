const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: String,
  rating: Number,
  lecturer: String,
  email: [String],
  description: String,
  img: String,
  category: String,
  topics: [String],
});

module.exports = mongoose.model("Course", CourseSchema);
