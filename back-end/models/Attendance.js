import mongoose from "mongoose";
import { Schema } from "mongoose";

const AttendanceSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true }, // normalized to midnight (local)
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    status: {
      type: String,
      enum: ["present", "late", "absent", "on-leave", "half-day"],
      default: "present",
    },
    workHours: { type: Number, default: 0 }, // computed on checkOut
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// one record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ userId: 1, date: -1 });
AttendanceSchema.index({ date: -1 });

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
