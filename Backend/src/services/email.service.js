import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Registration OTP',
    text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send OTP email');
  }
};
