import mongoose from "mongoose";
import { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    variant: {
      type: String,
      enum: ["default", "success", "error", "warning", "info"],
      default: "default",
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" }, // optional frontend link e.g. /admin-dashboard/leave/:id
    relatedId: { type: Schema.Types.ObjectId, default: null }, // e.g. Leave _id
  },
  { timestamps: true }
);

// for efficient unread count + pagination
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
