import express from "express";
import authmiddleware from "../middleware/authmiddleware.mjs";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  markAttendanceAdmin,
  deleteAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/check-in", authmiddleware, checkIn);
router.post("/check-out", authmiddleware, checkOut);
router.get("/my", authmiddleware, getMyAttendance);
router.get("/employee/:employeeId", authmiddleware, getAttendanceByEmployee);
router.get("/", authmiddleware, getAllAttendance);
router.post("/mark", authmiddleware, markAttendanceAdmin);
router.delete("/:id", authmiddleware, deleteAttendance);

export default router;
