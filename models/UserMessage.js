const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  courseName: { type: String, required: true }, // Change from courseId to courseName
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userMessage: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  fileUrl: { type: String },
  reply: { type: String }, // New field for the tutor's reply
});

module.exports = mongoose.model("Message", messageSchema);
