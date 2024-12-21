const express = require("express");
const router = express.Router();
const Tutor = require("../models/Tutor");
const verifyAdminToken = require("../middleware/verifyAdminToken ");
// Endpoint to get all tutor emails
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const tutors = await Tutor.find();
    res.status(200).json(tutors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutors", error });
  }
});
router.delete("/:id", verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "user deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
});
module.exports = router;
