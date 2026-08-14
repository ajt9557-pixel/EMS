import express from 'express';
import authmiddleware from '../middleware/authmiddleware.mjs';
import { addEmployee, upload } from '../controllers/employeeController.js';

const router = express.Router();

router.post('/add', authmiddleware, upload.single('image'), addEmployee);
//router.get('/', authmiddleware, getDepartments);
//router.get('/:id', authmiddleware, getDepartment);
//router.put('/:id', authmiddleware, updateDepartment);
//router.delete('/:id', authmiddleware, deleteDepartment);

export default router;
