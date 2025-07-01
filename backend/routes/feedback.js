const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const { feedback, rating, feedbackType } = req.body;

    // ✅ Basic validation
    if (!feedback || typeof rating !== 'number') {
      return res.status(400).json({ error: 'Feedback and rating are required.' });
    }

    // 🔐 Extract token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // ✅ Find user
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const senderEmail = user.email;

    // 📧 Email transport config
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    // ✅ Email options
    const RECEIVING_EMAIL = process.env.FEEDBACK_RECEIVING_EMAIL || 'your-actual-email@gmail.com';

    const mailOptions = {
      from: `"BookRadio Feedback" <${process.env.FEEDBACK_SENDER_EMAIL || process.env.EMAIL_USER}>`,
      to: RECEIVING_EMAIL,
      subject: `📢 New Feedback - ${feedbackType || 'General'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Feedback Received</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>From:</strong> ${senderEmail}</p>
            <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
            <p><strong>Type:</strong> ${feedbackType || 'General'}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 4px solid #007bff; padding-left: 16px; margin: 16px 0; color: #555;">
              ${feedback}
            </blockquote>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    // 🔄 Optional: verify transporter (skip in production for performance)
    if (process.env.NODE_ENV !== 'production') {
      await transporter.verify();
    }

    // 📤 Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: 'Feedback sent successfully',
      success: true
    });

  } catch (error) {
    console.error('❌ Error sending feedback:', error);

    let errorMessage = 'Server error while sending feedback';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Check your credentials.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Email service not found. Check your internet connection.';
    }

    return res.status(500).json({
      error: errorMessage,
      success: false
    });
  }
});

module.exports = router;
