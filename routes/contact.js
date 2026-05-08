const express = require("express");
const router = express.Router();

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

router.post("/", async (req, res) => {
  console.log("Contact request received:", new Date().toISOString());

  const { name, phone, email, company, message } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !phone || !email) {
    return res.status(400).json({ message: "Name, phone, and email are required." });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  const contactEmail = process.env.CONTACT_EMAIL?.trim();

  if (!brevoApiKey || !contactEmail) {
    return res.status(500).json({ message: "Email service is not configured." });
  }

  const safeName    = escapeHtml(name);
  const safePhone   = escapeHtml(phone);
  const safeEmail   = escapeHtml(email);
  const safeCompany = escapeHtml(company || "Not provided");
  const safeMessage = escapeHtml(message || "Not provided");

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: "O2BO Contact Form", email: "rachit.razobyte@gmail.com" },
        to: [{ email: contactEmail }],
        replyTo: { email: email, name: name },
        subject: "New Query - O2BO Contact Form",
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
            <tr><td><strong>Name</strong></td><td>${safeName}</td></tr>
            <tr><td><strong>Phone</strong></td><td>${safePhone}</td></tr>
            <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
            <tr><td><strong>Company</strong></td><td>${safeCompany}</td></tr>
            <tr><td><strong>Message</strong></td><td>${safeMessage}</td></tr>
          </table>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API error:", JSON.stringify(data));
      return res.status(500).json({ message: "Unable to send email right now. Please try again." });
    }

    console.log("Contact email sent:", email);
    return res.status(200).json({ message: "Contact form submitted successfully." });

  } catch (error) {
    console.error("Contact email failed:", error.message);
    return res.status(500).json({ message: "Unable to send email right now. Please try again." });
  }
});

module.exports = router;
