import express from 'express';
import authmiddleware from '../middleware/authmiddleware.mjs';
import { addEmployee, getEmployees, deleteEmployee, upload } from '../controllers/employeeController.js';

const router = express.Router();

router.post('/add', authmiddleware, upload.single('image'), addEmployee);
router.get('/', authmiddleware, getEmployees);
router.delete('/:id', authmiddleware, deleteEmployee);

export default router;
