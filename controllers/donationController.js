const axios = require("axios");
const Donation = require("../models/Donation");
const nodemailer = require("nodemailer");

const verifyPayment = async (req, res) => {
  const { reference, donorName, email, amount } = req.body;

  try {
    // Step 1: Verify Payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;

    if (status && data.status === "success") {
      // Step 2: Save donation to the database
      const donation = new Donation({
        donorName,
        email,
        amount,
        transactionId: data.id,
      });
      await donation.save();

      // Step 3: Send Confirmation Email
      sendThankYouEmail(email, donorName, amount);

      return res
        .status(200)
        .json({ success: true, message: "Donation recorded successfully!" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Transaction verification failed." });
    }
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ success: false, message: "Server Error." });
  }
};

const sendThankYouEmail = async (email, name, amount) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "donations@elearning.com",
    to: email,
    subject: "Thank You for Your Donation!",
    text: `Dear ${name},\n\nThank you for your generous donation of $${amount}. Your support means a lot to us!\n\nBest regards,\nThe E-Learning Team`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { verifyPayment };
