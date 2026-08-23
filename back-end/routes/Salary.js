import express from 'express';
import authmiddleware from '../middleware/authmiddleware.mjs';
import { addSalary, getSalaries, getMySalaries } from '../controllers/salaryController.js';

const router = express.Router();

router.post('/add', authmiddleware, addSalary);
router.get('/my', authmiddleware, getMySalaries);
router.get('/:employeeId', authmiddleware, getSalaries);

export default router;