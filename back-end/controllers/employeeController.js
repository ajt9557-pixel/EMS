import Employee from "../models/Employee.js";
import User from "../models/User.mjs";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

const uploadDir = path.join(os.tmpdir(), "uploads");
try {
    fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
    console.log("MULTER UPLOAD DIR CREATE FAILED:", err);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const addEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "User already exists" });
        }

        const existingEmployee = await Employee.findOne({ employeeId });
        if (existingEmployee) {
            return res.status(400).json({ success: false, error: "Employee ID already exists" });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            profilePicture: req.file ? req.file.filename : "",
            password: hashpassword,
            role,
        });
        await newUser.save();

        const newEmployee = new Employee({
            userId: newUser._id,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
        });
        await newEmployee.save();

        res.status(200).json({ success: true, message: "Employee added successfully" });
    } catch (error) {
        console.log('ADD EMPLOYEE ERROR:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: "Employee ID or email already exists" });
        }
        return res.status(500).json({ success: false, error: "add employee server error" });
    }
}

const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate("userId", "name email profilePicture")
            .populate("department", "dep_name")
            .sort({ createdAt: -1 });
        const data = employees.map((emp) => ({
            _id: emp._id,
            name: emp.userId?.name,
            email: emp.userId?.email,
            profilePicture: emp.userId?.profilePicture,
            dep_name: emp.department?.dep_name,
            salary: emp.salary,
        }));
        return res.status(200).json({ success: true, employees: data });
    } catch (error) {
        console.log('GET EMPLOYEES ERROR:', error);
        return res.status(500).json({ success: false, error: "get employees server error" });
    }
}

const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }
        if (employee.userId) {
            await User.findByIdAndDelete(employee.userId);
        }
        return res.status(200).json({ success: true, message: "Employee deleted successfully" });
    } catch (error) {
        console.log('DELETE EMPLOYEE ERROR:', error);
        return res.status(500).json({ success: false, error: "delete employee server error" });
    }
}

export { addEmployee, getEmployees, deleteEmployee, upload }
