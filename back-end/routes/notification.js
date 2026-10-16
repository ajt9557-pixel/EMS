import express from "express";
import authmiddleware from "../middleware/authmiddleware.mjs";
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  createNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authmiddleware, getNotifications);
router.put("/read-all", authmiddleware, markAllRead);
router.put("/:id/read", authmiddleware, markRead);
router.delete("/:id", authmiddleware, deleteNotification);
router.post("/", authmiddleware, createNotification);

export default router;
