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
import salaryRouter from './routes/Salary.js';
import LeaveRouter from './routes/Leave.js';
import settingsRouter from './routes/Settings.js';
if (!process.env.MONGODB_URL) console.warn('WARNING: MONGODB_URL not set');
if (!process.env.JWT_KEY) console.warn('WARNING: JWT_KEY not set - auth will fail');
connectDB().catch((err) => console.log('DB CONNECT ERROR:', err.message));
const app = express();
const allowedOrigin = process.env.FRONTEND_URL || process.env.VITE_API_URL || "*";
app.use(cors({ origin: allowedOrigin === "*" ? "*" : allowedOrigin.split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir, { dotfiles: 'deny', maxAge: '1d' }));
app.use('/api/auth', authRoutes);
app.use('/api/department', departmentRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/salary', salaryRouter);
app.use('/api/leave', LeaveRouter);
app.use('/api/settings', settingsRouter);

// Global error handler - ensures JSON with `error` field, never `undefined` alert
app.use((err, req, res, _next) => {
    console.log('GLOBAL ERROR:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: "Image too large (max 2MB)" });
    }
    if (err.message && /Only jpeg/.test(err.message)) {
        return res.status(400).json({ success: false, error: err.message });
    }
    return res.status(err.status || 500).json({ success: false, error: err.message || "server error" });
});



export default app;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}
