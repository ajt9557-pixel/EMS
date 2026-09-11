import express from 'express';
import bcrypt from 'bcryptjs';
import authmiddleware from '../middleware/authmiddleware.mjs';
import User from '../models/User.mjs';
import { addEmployee, getEmployees, getEmployee, getMyProfile, updateEmployee, deleteEmployee, upload, fetchEmployeesByDepId, updateMyProfilePicture} from '../controllers/employeeController.js';

const router = express.Router();

const handleUpload = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, error: "Image too large (max 2MB)" });
            }
            return res.status(400).json({ success: false, error: err.message || "File upload failed" });
        }
        next();
    });
};

router.post('/add', authmiddleware, handleUpload, addEmployee);
router.get('/', authmiddleware, getEmployees);
router.get('/department/:id', authmiddleware, fetchEmployeesByDepId);
router.get('/my-profile', authmiddleware, getMyProfile);
router.put('/my-profile/picture', authmiddleware, handleUpload, updateMyProfilePicture);

router.put('/settings/change-password', authmiddleware, async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        const targetId = userId || req.user?._id;
        if (!oldPassword || !newPassword) return res.status(400).json({ success: false, error: 'oldPassword and newPassword required' });
        if (newPassword.length < 6) return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
        const user = await User.findById(targetId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Old password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', authmiddleware, getEmployee);
router.put('/:id', authmiddleware, handleUpload, updateEmployee);
router.delete('/:id', authmiddleware, deleteEmployee);

export default router;