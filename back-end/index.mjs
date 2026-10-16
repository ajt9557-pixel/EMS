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
import notificationRouter from './routes/notification.js';
import attendanceRouter from './routes/Attendance.js';
import meetingRouter from './routes/Meeting.js';
if (!process.env.MONGODB_URL) console.warn('WARNING: MONGODB_URL not set');
if (!process.env.JWT_KEY) console.warn('WARNING: JWT_KEY not set - auth will fail');
connectDB().catch((err) => console.log('DB CONNECT ERROR:', err.message));
const app = express();

// Vercel: ensure DB is connected for every request (serverless cold-start safe)
app.use(async (req, res, next) => {
    try {
        await connectDB();
    } catch (e) {
        console.log('DB middleware connect failed:', e.message);
    }
    next();
});

// CORS: support comma-separated origins, trim, ignore trailing slashes, allow Vercel previews
// FRONTEND_URL on Vercel should be set to front-end URL(s) e.g. https://ems-aics.vercel.app,https://ems-aics-*.vercel.app
const rawOrigin = process.env.FRONTEND_URL || process.env.VITE_API_URL || "*";
const allowedOrigins = rawOrigin === "*"
    ? "*"
    : rawOrigin.split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        // allow non-browser requests (no origin) and wildcard
        if (!origin || allowedOrigins === "*") return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, '');
        // exact match
        if (allowedOrigins.includes(cleanOrigin)) return callback(null, true);
        // allow Vercel preview wildcards like https://ems-aics-*.vercel.app
        const isVercelPreview = /^https:\/\/.*\.vercel\.app$/.test(cleanOrigin);
        if (isVercelPreview) {
            // if FRONTEND_URL contains a vercel.app domain, allow any sub-preview
            const hasVercelAllowed = allowedOrigins.some(o => o.includes('vercel.app'));
            if (hasVercelAllowed) return callback(null, true);
        }
        // allow localhost for dev
        if (/^http:\/\/localhost:\d+$/.test(cleanOrigin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(cleanOrigin)) {
            return callback(null, true);
        }
        console.log('CORS blocked origin:', cleanOrigin);
        return callback(new Error(`CORS blocked: ${cleanOrigin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir, { dotfiles: 'deny', maxAge: '1d' }));
// Health check for Vercel
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/department', departmentRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/salary', salaryRouter);
app.use('/api/leave', LeaveRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/meetings', meetingRouter);

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
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
