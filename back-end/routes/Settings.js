import express from 'express';
import authmiddleware from '../middleware/authmiddleware.mjs';
import { changePassword } from '../controllers/settingsController.js';
import { upload, updateMyProfilePicture } from '../controllers/employeeController.js';

const router = express.Router();

router.put('/update', authmiddleware, changePassword);
router.put('/profile-picture', authmiddleware, upload.single('image'), updateMyProfilePicture);

export default router;