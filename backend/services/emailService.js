const nodemailer = require("nodemailer");

// Create Mailtrap transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

// Send verification email
const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const mailOptions = {
      from: `"${process.env.MAILTRAP_FROM_NAME}" <${process.env.MAILTRAP_FROM_EMAIL}>`,
      to: email,
      subject: "WasteZero - Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0;">🌱 WasteZero</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Verify Your Email Address</p>
            </div>

            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Thank you for registering with <strong>WasteZero</strong>! 
              To complete your registration, please verify your email address.
            </p>

            <div style="background-color: #ecfdf5; border-left: 4px solid #16a34a; padding: 20px; margin: 25px 0; border-radius: 5px;">
              <p style="color: #333; margin: 0 0 15px 0; font-size: 14px;">
                Your verification code is:
              </p>
              <h2 style="color: #16a34a; font-size: 32px; letter-spacing: 5px; margin: 0; text-align: center;">
                ${verificationCode}
              </h2>
            </div>

            <p style="color: #666; font-size: 14px; margin: 20px 0;">
              This code will expire in 1 hour. If you didn't create this account, please ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2026 WasteZero Initiative. All rights reserved.<br>
              Helping the environment, one step at a time.
            </p>

          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
