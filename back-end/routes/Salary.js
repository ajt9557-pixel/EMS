import express from 'express';
import authmiddleware from '../middleware/authmiddleware.mjs';
import { addSalary, getSalaries, getMySalaries, getAllSalaries } from '../controllers/salaryController.js';

const router = express.Router();

// IMPORTANT: order matters - static routes before param routes
router.post('/add', authmiddleware, addSalary);
router.get('/my', authmiddleware, getMySalaries);
router.get('/', authmiddleware, getAllSalaries);
router.get('/:employeeId', authmiddleware, getSalaries);

export default router;