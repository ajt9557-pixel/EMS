import express from 'express';
import authmiddleware from '../middleware/authmiddleware.mjs';
import { addLeave , getMyLeaves , getLeaves, getLeave, updateLeave} from '../controllers/LeaveController.js';
const router = express.Router();

router.post('/add', authmiddleware, addLeave);
router.get('/my-leaves', authmiddleware, getMyLeaves);
router.get('/:id', authmiddleware, getLeave);
router.put('/:id', authmiddleware, updateLeave);
router.post('/', authmiddleware, getLeaves);


export default router;