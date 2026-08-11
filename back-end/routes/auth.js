import express from 'express';
import { login, verify } from '../controllers/authcontroller.js';
import authmiddleware from '../middleware/authmiddleware.mjs';

const router = express.Router();

router.post('/login', login);
router.get('/verify', authmiddleware, verify);

export default router;