const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  id: { type: Number, unique: true, autoIncrement: true },
  title: { type: String, required: true },
  rating: { type: Number, default: 0 },
  lecturer: { type: String, required: true },
  email: { type: String, required: true },
  description: { type: String, required: true },
  img: { type: String },
  category: { type: String, required: true },
  topics: { type: [String], required: true },
});

module.exports = mongoose.model("Course", courseSchema);
