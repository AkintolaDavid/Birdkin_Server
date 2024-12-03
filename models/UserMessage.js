const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  userMessage: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  fileUrl: { type: String },
});

module.exports = mongoose.model("Message", messageSchema);
