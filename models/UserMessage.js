const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userMessage: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  fileUrl: { type: String },
  replies: [{ type: String }], // Array of strings for multiple replies
});

module.exports = mongoose.model("Message", messageSchema);
