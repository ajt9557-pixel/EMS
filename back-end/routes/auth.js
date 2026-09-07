import express from 'express';
import { login, verify } from '../controllers/authcontroller.js';
import authmiddleware from '../middleware/authmiddleware.mjs';

const router = express.Router();

const loginAttempts = new Map();
const loginRateLimit = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const max = 10;
    const arr = loginAttempts.get(ip) || [];
    const recent = arr.filter(t => now - t < windowMs);
    if (recent.length >= max) return res.status(429).json({ success: false, error: "Too many login attempts, try again later" });
    recent.push(now);
    loginAttempts.set(ip, recent);
    next();
};

router.post('/login', loginRateLimit, login);
router.get('/verify', authmiddleware, verify);

export default router;