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
    await Tutor.findByIdAndDelete(id);
    res.status(200).json({ message: "Tutor deleted successfully." });
  } catch (error) {
    console.error("Error deleting Tutor:", error);
    res.status(500).json({ error: "Failed to delete Tutor." });
  }
});
module.exports = router;
