import mongoose from "mongoose";
import { Schema } from "mongoose";

const LeaveSchema = new Schema ({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
   leaveType: {
     type: String,
     enum: ['sick', 'casual', 'maternity', 'paternity'],
      required: true 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String,
         enum: ['pending', 'approved', 'rejected'],
         default: 'pending' 
    },
    appliedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

const Leave = mongoose.model('Leave', LeaveSchema)
export default Leave