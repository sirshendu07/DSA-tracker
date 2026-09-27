const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../services/emailService');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. Send OTP for Signup
router.post('/send-signup-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    // Check if user already exists
    let user = await User.findOne({ email: cleanEmail });

    if (user && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      user.name = cleanName;
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      // Create pending unverified user with temp dummy password
      const tempHash = await bcrypt.hash(Math.random().toString(), 10);
      user = new User({
        name: cleanName,
        email: cleanEmail,
        password: tempHash,
        isVerified: false,
        otp,
        otpExpiresAt
      });
      await user.save();
    }

    // Send OTP email via Gmail SMTP
    await sendOtpEmail(cleanEmail, otp, 'signup');

    res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please check your inbox.`
    });
  } catch (error) {
    console.error('Error sending signup OTP:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP email.' });
  }
});

// 2. Verify OTP and Complete Signup
router.post('/verify-otp-and-signup', async (req, res) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Account not found. Please request a new code.' });
    }

    // Validate OTP
    if (!user.otp || user.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    // Hash actual user password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    if (name) user.name = name.trim();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account successfully verified and created!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error verifying OTP and signing up:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        isUnverified: true,
        message: 'Your email has not been verified yet. Please verify your OTP.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Get Current User (/me)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpiresAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, purpose = 'signup' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please sign up first.' });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(cleanEmail, otp, purpose);

    res.json({ success: true, message: `New verification code sent to ${cleanEmail}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Forgot Password - Request OTP
router.post('/forgot-password-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, isVerified: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No verified account found with this email.' });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(cleanEmail, otp, 'reset');

    res.json({
      success: true,
      message: `Password reset code sent to ${cleanEmail}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Reset Password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || user.otp !== otp.trim() || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
