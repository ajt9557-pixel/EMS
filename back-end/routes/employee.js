import express from 'express';
import bcrypt from 'bcryptjs';
import authmiddleware from '../middleware/authmiddleware.mjs';
import User from '../models/User.mjs';
import { addEmployee, getEmployees, getEmployee, getMyProfile, updateEmployee, deleteEmployee, upload, fetchEmployeesByDepId} from '../controllers/employeeController.js';

const router = express.Router();

router.post('/add', authmiddleware, upload.single('image'), addEmployee);
router.get('/', authmiddleware, getEmployees);
router.get('/department/:id', authmiddleware, fetchEmployeesByDepId);
router.get('/my-profile', authmiddleware, getMyProfile);

router.put('/settings/change-password', authmiddleware, async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Old password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', authmiddleware, getEmployee);
router.put('/:id', authmiddleware, upload.single('image'), updateEmployee);
router.delete('/:id', authmiddleware, deleteEmployee);

export default router;