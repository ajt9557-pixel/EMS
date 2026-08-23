import Employee from "../models/Employee.js";
import User from "../models/User.mjs";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

export const uploadDir = path.join(os.tmpdir(), "uploads");
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
            placeOfBirth,
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
            placeOfBirth,
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
            .populate("userId", "name email profilePicture role")
            .populate("department", "dep_name")
            .sort({ createdAt: -1 });
        const data = employees.map((emp) => ({
            _id: emp._id,
            name: emp.userId?.name,
            email: emp.userId?.email,
            profilePicture: emp.userId?.profilePicture,
            role: emp.userId?.role,
            employeeId: emp.employeeId,
            placeOfBirth: emp.placeOfBirth,
            dep_name: emp.department?.dep_name,
            department: emp.department?._id,
            salary: emp.salary,
            gender: emp.gender,
            maritalStatus: emp.maritalStatus,
            dob: emp.dob,
        }));
        return res.status(200).json({ success: true, employees: data });
    } catch (error) {
        console.log('GET EMPLOYEES ERROR:', error);
        return res.status(500).json({ success: false, error: "get employees server error" });
    }
}

const getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate("userId", "name email profilePicture role")
            .populate("department", "dep_name");
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }
        return res.status(200).json({
            success: true,
            employee: {
                _id: employee._id,
                employeeId: employee.employeeId,
                name: employee.userId?.name,
                email: employee.userId?.email,
                profilePicture: employee.userId?.profilePicture,
                role: employee.userId?.role,
                placeOfBirth: employee.placeOfBirth,
                department: employee.department ? { _id: employee.department._id, dep_name: employee.department.dep_name } : null,
                dep_name: employee.department?.dep_name,
                salary: employee.salary,
                gender: employee.gender,
                maritalStatus: employee.maritalStatus,
                dob: employee.dob,
            },
        });
    } catch (error) {
        console.log('GET EMPLOYEE ERROR:', error);
        return res.status(500).json({ success: false, error: "get employee server error" });
    }
}

const getMyProfile = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id })
            .populate("userId", "name email profilePicture role")
            .populate("department", "dep_name");
        if (!employee) {
            return res.status(404).json({ success: false, error: "No employee profile is linked to this account" });
        }
        return res.status(200).json({
            success: true,
            employee: {
                _id: employee._id,
                employeeId: employee.employeeId,
                name: employee.userId?.name,
                email: employee.userId?.email,
                profilePicture: employee.userId?.profilePicture,
                role: employee.userId?.role,
                placeOfBirth: employee.placeOfBirth,
                department: employee.department ? { _id: employee.department._id, dep_name: employee.department.dep_name } : null,
                dep_name: employee.department?.dep_name,
                salary: employee.salary,
                gender: employee.gender,
                maritalStatus: employee.maritalStatus,
                dob: employee.dob,
            },
        });
    } catch (error) {
        console.log('MY PROFILE ERROR:', error);
        return res.status(500).json({ success: false, error: "get my profile server error" });
    }
}

const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }

        const {
            name,
            email,
            password,
            employeeId,
            dob,
            gender,
            maritalStatus,
            placeOfBirth,
            department,
            salary,
            role
        } = req.body;

        if (employee.userId) {
            const user = await User.findById(employee.userId);
            if (user) {
                if (name !== undefined) user.name = name;
                if (email !== undefined) user.email = email;
                if (role !== undefined) user.role = role;
                if (req.file) user.profilePicture = req.file.filename;
                if (password && password.trim() !== "") {
                    user.password = await bcrypt.hash(password, 10);
                }
                await user.save();
            }
        }

        if (employeeId !== undefined) employee.employeeId = employeeId;
        if (dob !== undefined) employee.dob = dob;
        if (gender !== undefined) employee.gender = gender;
        if (maritalStatus !== undefined) employee.maritalStatus = maritalStatus;
        if (placeOfBirth !== undefined) employee.placeOfBirth = placeOfBirth;
        if (department !== undefined) employee.department = department;
        if (salary !== undefined) employee.salary = salary;
        await employee.save();

        return res.status(200).json({ success: true, message: "Employee updated successfully" });
    } catch (error) {
        console.log('UPDATE EMPLOYEE ERROR:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: "Employee ID already exists" });
        }
        return res.status(500).json({ success: false, error: "update employee server error" });
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

 const fetchEmployeesByDepId = async (req, res) => {
     try {
        const employees = await Employee.find({ department: req.params.id })
            .populate("userId", "name email profilePicture role")
            .populate("department", "dep_name");
        const data = employees.map((emp) => ({
            _id: emp._id,
            employeeId: emp.employeeId,
            name: emp.userId?.name,
            email: emp.userId?.email,
            profilePicture: emp.userId?.profilePicture,
            role: emp.userId?.role,
            placeOfBirth: emp.placeOfBirth,
            department: emp.department ? { _id: emp.department._id, dep_name: emp.department.dep_name } : null,
            dep_name: emp.department?.dep_name,
            salary: emp.salary,
            gender: emp.gender,
            maritalStatus: emp.maritalStatus,
            dob: emp.dob,
        }));
        return res.status(200).json({ success: true, employees: data });
    } catch (error) {
        console.log('GET EMPLOYEES BY DEP ERROR:', error);
        return res.status(500).json({ success: false, error: "get employees server error" });
    }
 }

export { addEmployee, getEmployees, getEmployee, getMyProfile, updateEmployee, deleteEmployee, upload , fetchEmployeesByDepId};
