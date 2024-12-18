const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const sendOwnerMail = async (name, email, number, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "donations@elearning.com",
    to: process.env.OWNER_EMAIL,
    subject: `A contact message was sent ny ${name}`,
    text: `Dear Birdkin you have a new message,\n\n from: ${email} /n phone :${phone} /n message:${message}.`,
  };

  await transporter.sendMail(mailOptions);
};
router.use(bodyParser.json());

router.post("/", (req, res) => {
  const { name, email, number, message } = req.body;

  if (!name || !email || !number || !message) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  sendOwnerMail(name, email, number, message);

  res.status(200).json({
    message: "Your message has been received. Thank you!",
  });
});

module.exports = router;
