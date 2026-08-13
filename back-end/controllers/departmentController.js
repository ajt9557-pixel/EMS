import Department from "../models/Department.js";
import connectDB from "../db/db.mjs";

const addDepartment = async (req, res) => {
    try {
        const { dep_name, description } = req.body;
        if (!dep_name || !description) {
            return res.status(400).json({ success: false, error: "Department name and description are required" });
        }
        const newDep = new Department({
            dep_name,
            description
        });
        await newDep.save();
        return res.status(201).json({ success: true, department: newDep, message: "Department added successfully" });
    } catch (error) {
        console.log('ADD DEPARTMENT ERROR:', error);
        return res.status(500).json({ success: false, error: "add department server error" });
    }
}

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ createAt: -1 });
        return res.status(200).json({ success: true, departments });
    } catch (error) {
        console.log('GET DEPARTMENTS ERROR:', error);
        return res.status(500).json({ success: false, error: "get departments server error" });
    }
}

const getDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, error: "Department not found" });
        }
        return res.status(200).json({ success: true, department });
    } catch (error) {
        console.log('GET DEPARTMENT ERROR:', error);
        return res.status(500).json({ success: false, error: "get department server error" });
    }
}

const updateDepartment = async (req, res) => {
    try {
        const { dep_name, description } = req.body;
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { dep_name, description, updateAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!department) {
            return res.status(404).json({ success: false, error: "Department not found" });
        }
        return res.status(200).json({ success: true, department, message: "Department updated successfully" });
    } catch (error) {
        console.log('UPDATE DEPARTMENT ERROR:', error);
        return res.status(500).json({ success: false, error: "update department server error" });
    }
}

const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, error: "Department not found" });
        }
        return res.status(200).json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        console.log('DELETE DEPARTMENT ERROR:', error);
        return res.status(500).json({ success: false, error: "delete department server error" });
    }
}

export { addDepartment, getDepartments, getDepartment, updateDepartment, deleteDepartment }
