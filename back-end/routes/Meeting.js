import express from "express";
import authmiddleware from "../middleware/authmiddleware.mjs";
import { createMeeting, getMeetings, getMeeting, updateMeeting, deleteMeeting } from "../controllers/meetingController.js";

const router = express.Router();

router.post("/add", authmiddleware, createMeeting);
router.get("/", authmiddleware, getMeetings);
router.get("/:id", authmiddleware, getMeeting);
router.put("/:id", authmiddleware, updateMeeting);
router.delete("/:id", authmiddleware, deleteMeeting);

export default router;
