const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: String, enum: ["tutor", "user"], required: true }, // Sender type
  date: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  userMessage: { type: String, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the user
  replies: [replySchema], // Array of replies
});

module.exports = mongoose.model("Message", messageSchema);
