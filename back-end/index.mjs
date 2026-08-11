import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import authRoutes from './routes/auth.js';
import connectDB from './db/db.mjs';

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth',authRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});