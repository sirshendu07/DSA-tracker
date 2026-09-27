const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Send 6-digit OTP verification email
 * @param {string} email
 * @param {string} otp
 * @param {string} purpose - 'signup' | 'login' | 'reset'
 */
async function sendOtpEmail(email, otp, purpose = 'signup') {
  const isReset = purpose === 'reset';
  const subject = isReset
    ? `🔑 ${otp} is your LeetPulse Password Reset Code`
    : `⚡ ${otp} is your LeetPulse Verification Code`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 32px 24px; text-align: center; }
          .brand { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
          .tagline { font-size: 13px; color: #e0e7ff; margin-top: 4px; }
          .content { padding: 32px 28px; text-align: center; }
          .greeting { font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
          .desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
          .otp-box { background: #1e293b; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
          .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #818cf8; }
          .expiry { font-size: 12px; color: #cbd5e1; margin-top: 10px; }
          .security-note { font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px; }
          .footer { background: #0b0f19; padding: 16px; text-align: center; font-size: 11px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">🚀 LeetPulse</div>
            <div class="tagline">FAANG DSA Mastery & Analytics</div>
          </div>
          <div class="content">
            <div class="greeting">${isReset ? 'Password Reset Request' : 'Verify Your Email Address'}</div>
            <p class="desc">
              ${
                isReset
                  ? 'We received a request to reset your password. Use the verification code below to proceed:'
                  : 'Welcome to LeetPulse! To complete your registration and begin tracking your FAANG roadmap, use this 6-digit verification code:'
              }
            </p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="expiry">⏳ Code expires in <strong>10 minutes</strong></div>
            </div>
            <p class="security-note">
              Never share this code with anyone. If you did not request this code, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} LeetPulse • 5 Questions/Day FAANG Roadmap
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"${process.env.SENDER_NAME || 'LeetPulse Verification'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject,
    html
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = {
  transporter,
  sendOtpEmail
};
