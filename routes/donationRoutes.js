const express = require("express");
const { verifyPayment } = require("../controllers/donationController");

const router = express.Router();

router.post("/verify-payment", verifyPayment);

module.exports = router;
