import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import complaintRoutes from './routes/complaints.routes.js';

const app = express();

// Middleware
app.use(morgan('dev')); // API response tracking
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://pratapankit25.github.io'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
