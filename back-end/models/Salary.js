import mongoose from "mongoose";
import { Schema } from "mongoose";

const salarySchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  basicSalary: { type: Number, required: true, min: 0 },
  allowances: { type: Number, default: 0, min: 0 },
  deductions: { type: Number, default: 0, min: 0 },
  netSalary: { type: Number, required: true },
  payDate: { type: Date, required: true, index: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

const Salary = mongoose.model('Salary', salarySchema);
export default Salary;