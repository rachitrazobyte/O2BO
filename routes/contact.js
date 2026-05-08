const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

router.post("/", async (req, res) => {
  const { name, phone, email, company, message } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !phone || !email) {
    return res.status(400).json({
      message: "Name, phone, and email are required.",
    });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address.",
    });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.CONTACT_EMAIL) {
    return res.status(500).json({
      message: "Email service is not configured.",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email);
  const safeCompany = escapeHtml(company || "Not provided");
  const safeMessage = escapeHtml(message || "Not provided");

  try {
    await transporter.sendMail({
      from: `"New query O2BO" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.CONTACT_EMAIL,
      subject: "New query",
      html: `
        <h2>New query</h2>
        <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
          <tr><td><strong>Name</strong></td><td>${safeName}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${safePhone}</td></tr>
          <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
          <tr><td><strong>Company</strong></td><td>${safeCompany}</td></tr>
          <tr><td><strong>Message</strong></td><td>${safeMessage}</td></tr>
        </table>
      `,
    });

    return res.status(200).json({
      message: "Contact form submitted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to send email right now. Please try again.",
    });
  }
});

module.exports = router;
