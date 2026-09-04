import express from 'express';
import authmiddleware from '../middleware/authmiddleware.mjs';
import { changePassword } from '../controllers/settingsController.js';

const router = express.Router();

router.put('/update', authmiddleware, changePassword);

export default router;