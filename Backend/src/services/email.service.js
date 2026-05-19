import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (to, otp) => {
  console.log('ENTER: sendOTPEmail');
  try {
    const { data, error } = await resend.emails.send({
      from: 'Complaints Platform <onboarding@resend.dev>',
      to: [to],
      subject: 'Your Registration OTP',
      text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(`OTP sent to ${to}: ${otp}`);
    console.log('EXIT: sendOTPEmail');
    return data;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw new Error('Could not send OTP email');
  }
};
