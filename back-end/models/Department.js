import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    dep_name: {type: String, required: true, unique: true, trim: true, minlength: 2},
    description: {type: String, required: true, trim: true, minlength: 5},
    createAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},
}, { timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })

const Department = mongoose.model("Department", departmentSchema);

export default Department;