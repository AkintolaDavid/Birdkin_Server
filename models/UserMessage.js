const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userMessage: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  fileUrl: { type: String },
  replies: [
    {
      content: { type: String, required: true },
      type: { type: String, required: true, enum: ["tutor", "user"] },
    },
  ],
});

module.exports = mongoose.model("Message", messageSchema);
