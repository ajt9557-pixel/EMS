import Notification from "../models/Notification.js";

// GET /api/notifications - get current user's notifications (newest first)
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.log("GET NOTIFICATIONS ERROR:", error);
    return res.status(500).json({ success: false, error: "get notifications server error" });
  }
};

// PUT /api/notifications/:id/read - mark single as read
const markRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!notif) return res.status(404).json({ success: false, error: "Notification not found" });
    notif.read = true;
    await notif.save();
    return res.status(200).json({ success: true, notification: notif });
  } catch (error) {
    console.log("MARK READ ERROR:", error);
    return res.status(500).json({ success: false, error: "mark read server error" });
  }
};

// PUT /api/notifications/read-all - mark all as read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("MARK ALL READ ERROR:", error);
    return res.status(500).json({ success: false, error: "mark all read server error" });
  }
};

// DELETE /api/notifications/:id - dismiss/delete notification
const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!notif) return res.status(404).json({ success: false, error: "Notification not found" });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("DELETE NOTIFICATION ERROR:", error);
    return res.status(500).json({ success: false, error: "delete notification server error" });
  }
};

// POST /api/notifications - helper for internal use/manual test (admin or self)
// body: { userId?, title, message, variant, link, relatedId } -> if userId omitted, creates for req.user
const createNotification = async (req, res) => {
  try {
    const { userId, title, message, variant = "default", link = "", relatedId = null } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, error: "title and message required" });
    const targetUserId = userId || req.user._id;
    const notif = await Notification.create({ userId: targetUserId, title, message, variant, link, relatedId });
    return res.status(201).json({ success: true, notification: notif });
  } catch (error) {
    console.log("CREATE NOTIFICATION ERROR:", error);
    return res.status(500).json({ success: false, error: "create notification server error" });
  }
};

// internal helper used by other controllers (no req/res)
export const createNotificationForUser = async ({ userId, title, message, variant = "default", link = "", relatedId = null }) => {
  try {
    if (!userId) return null;
    return await Notification.create({ userId, title, message, variant, link, relatedId });
  } catch (e) {
    console.log("createNotificationForUser failed:", e.message);
    return null;
  }
};

export { getNotifications, markRead, markAllRead, deleteNotification, createNotification };
