import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendOTPEmail } from '../services/email.service.js';
import 'dotenv/config';

export const sendOtp = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if user already exists and is verified
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0 && existingUser[0].is_verified) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    if (existingUser.length === 0) {
      // Create new unverified user
      await db.insert(users).values({
        name,
        email,
        otp,
        otp_expiry: otpExpiry,
        is_verified: false,
      });
    } else {
      // Update existing unverified user
      await db.update(users).set({
        name,
        otp,
        otp_expiry: otpExpiry
      }).where(eq(users.email, email));
    }

    // Send email
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: 'Email, OTP, and password are required' });
    }

    const user = await db.select().from(users).where(eq(users.email, email));
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user[0];

    if (userData.is_verified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    if (userData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > new Date(userData.otp_expiry)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Update user: verify and set password (plain text as requested)
    await db.update(users).set({
      is_verified: true,
      password: password,
      otp: null,
      otp_expiry: null,
    }).where(eq(users.id, userData.id));

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.select().from(users).where(eq(users.email, email));
    
    if (user.length === 0 || !user[0].is_verified) {
      return res.status(401).json({ error: 'Invalid credentials or unverified account' });
    }

    const userData = user[0];

    if (userData.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: userData.id, name: userData.name, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: false, // As per requirements
      secure: false, // As per requirements
      sameSite: 'lax', // Relaxed for local testing
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
      name: userData.name,
      email: userData.email,
      role: userData.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = (req, res) => {
  // req.user is set by auth middleware
  res.json({
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
};
