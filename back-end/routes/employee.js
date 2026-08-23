import express from 'express';
import authmiddleware from '../middleware/authmiddleware.mjs';
import { addEmployee, getEmployees, getEmployee, getMyProfile, updateEmployee, deleteEmployee, upload, fetchEmployeesByDepId} from '../controllers/employeeController.js';

const router = express.Router();

router.post('/add', authmiddleware, upload.single('image'), addEmployee);
router.get('/', authmiddleware, getEmployees);
router.get('/department/:id', authmiddleware, fetchEmployeesByDepId);
router.get('/my-profile', authmiddleware, getMyProfile);
router.get('/:id', authmiddleware, getEmployee);
router.put('/:id', authmiddleware, upload.single('image'), updateEmployee);
router.delete('/:id', authmiddleware, deleteEmployee);

export default router;
