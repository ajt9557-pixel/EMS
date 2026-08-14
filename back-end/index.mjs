import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import connectDB from './db/db.mjs';
import departmentRouter from './routes/department.js';
import employeeRouter from './routes/employee.js';
import { uploadDir } from './controllers/employeeController.js';

connectDB().catch((err) => console.log('DB CONNECT ERROR:', err.message));
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));
app.use('/api/auth', authRoutes);
app.use('/api/department', departmentRouter);
app.use('/api/employee', employeeRouter);

export default app;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}
