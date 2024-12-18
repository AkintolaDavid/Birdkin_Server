const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/course");
const interactionRoutes = require("./routes/interactions");
const tutorRoutes = require("./routes/tutor");
const donationRoutes = require("./routes/donationRoutes");
const contactRoutes = require("./routes/contact");
const cors = require("cors");
// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:5173", "https://birdkins.vercel.app"], // Replace with your frontend URL in production
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
// Connect to MongoDB
connectDB(); // Using the `connectDB` function from db.js

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/courses", courseRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/contact", contactRoutes);
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
