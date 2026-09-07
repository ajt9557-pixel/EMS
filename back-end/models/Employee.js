import mongoose from "mongoose";
import { Schema } from "mongoose";

const employeeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  employeeId: { type: String, required: true, unique: true, trim: true },
  dob: { type: Date },
  gender: { type: String, enum: ["male", "female", "other", ""] },
  maritalStatus: { type: String, enum: ["single", "married", "other", ""] },
  placeOfBirth: { type: String, trim: true },
  department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
  salary: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;