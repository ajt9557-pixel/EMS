import mongoose from "mongoose";
import { Schema } from "mongoose";

const MeetingSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    date: { type: Date, required: true, index: true }, // meeting day (midnight normalized)
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },
    type: {
      type: String,
      enum: ["business_meeting", "training", "holiday", "deadline", "other", "general"],
      default: "business_meeting",
    },
    location: { type: String, trim: true, default: "" },
    department: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    color: { type: String, default: "" }, // tailwind color hint
  },
  { timestamps: true }
);

MeetingSchema.index({ date: -1, type: 1 });
MeetingSchema.index({ createdBy: 1 });

const Meeting = mongoose.model("Meeting", MeetingSchema);
export default Meeting;
