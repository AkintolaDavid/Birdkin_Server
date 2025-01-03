const express = require("express");
const { verifyPayment } = require("../controllers/donationController");
const Donation = require("../models/Donation");
const router = express.Router();
const verifyAdminToken = require("../middleware/verifyAdminToken ");
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const donations = await Donation.find();
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: "failed to fetch Donation" });
  }
});
router.post("/verify-payment", verifyAdminToken, verifyPayment);

module.exports = router;
