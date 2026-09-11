import Employee from "../models/Employee.js";
import User from "../models/User.mjs";
import Department from "../models/Department.js";
import Salary from "../models/Salary.js";
import Leave from "../models/Leave.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
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
        const ext = path.extname(file.originalname).toLowerCase();
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2,8);
        cb(null, id + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/^image\/(jpeg|png|jpg|webp)$/.test(file.mimetype)) cb(null, true);
        else cb(new Error("Only jpeg, png, jpg, webp images allowed"));
    }
});

const addEmployee = async (req, res) => {
    const uploadedFile = req.file ? path.join(uploadDir, req.file.filename) : null;
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

        const roleNorm = String(role || "user").toLowerCase().trim();
        const isAdminCreate = roleNorm === "admin";
        const willCreateEmployee = !isAdminCreate || !!department || (salary !== undefined && salary !== "" && salary !== null);

        if (!name?.trim() || !email?.trim() || !password?.trim() || (willCreateEmployee && !employeeId?.trim())) {
            if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
            return res.status(400).json({ success: false, error: willCreateEmployee ? "name, email, password, employeeId are required" : "name, email, password are required" });
        }
        // department/salary required for non-admin; optional for admin
        if (!isAdminCreate && (!department || salary === undefined || salary === "")) {
            if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
            return res.status(400).json({ success: false, error: "department and salary are required for employees" });
        }
        let salaryNum = undefined;
        if (salary !== undefined && salary !== "" && salary !== null) {
            salaryNum = Number(salary);
            if (!Number.isFinite(salaryNum) || salaryNum < 0) {
                if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
                return res.status(400).json({ success: false, error: "Invalid salary" });
            }
        } else if (!isAdminCreate) {
            if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
            return res.status(400).json({ success: false, error: "Invalid salary" });
        }
        if (department && !/^[0-9a-fA-F]{24}$/.test(department)) {
            if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
            return res.status(400).json({ success: false, error: "Invalid department ID" });
        }
        if (department) {
            const deptExists = await Department.findById(department);
            if (!deptExists) {
                if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
                return res.status(400).json({ success: false, error: "Department not found" });
            }
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
            return res.status(400).json({ success: false, error: "User already exists" });
        }

        if (willCreateEmployee) {
            const existingEmployee = await Employee.findOne({ employeeId: employeeId.trim() });
            if (existingEmployee) {
                if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
                return res.status(400).json({ success: false, error: "Employee ID already exists" });
            }
        }

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            profilePicture: req.file ? req.file.filename : "",
            password: password,
            role: roleNorm,
        });
        await newUser.save();

        // For admin without department/salary, skip Employee creation (admin-only account like seed)
        const shouldCreateEmployee = willCreateEmployee;
        if (shouldCreateEmployee) {
            // if admin but missing fields, use defaults to satisfy schema
            const deptForEmp = department || undefined;
            let salaryForEmp = salaryNum;
            if (isAdminCreate && salaryForEmp === undefined) salaryForEmp = 0;
            if (!deptForEmp) {
                await User.findByIdAndDelete(newUser._id);
                if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
                return res.status(400).json({ success: false, error: "department is required when creating employee record" });
            }
            if (salaryForEmp === undefined) {
                await User.findByIdAndDelete(newUser._id);
                if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
                return res.status(400).json({ success: false, error: "salary is required when creating employee record" });
            }
            try {
                const newEmployee = new Employee({
                    userId: newUser._id,
                    employeeId: employeeId.trim(),
                    dob,
                    gender,
                    maritalStatus,
                    placeOfBirth: placeOfBirth?.trim(),
                    department: deptForEmp,
                    salary: salaryForEmp,
                });
                await newEmployee.save();
            } catch (empErr) {
                await User.findByIdAndDelete(newUser._id);
                if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
                throw empErr;
            }
        }

        return res.status(201).json({ success: true, message: isAdminCreate && !shouldCreateEmployee ? "Admin added successfully" : "Employee added successfully" });
    } catch (error) {
        console.log('ADD EMPLOYEE ERROR:', error);
        if (uploadedFile && fs.existsSync(uploadedFile)) {
            try { fs.unlinkSync(uploadedFile); } catch {}
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: "Employee ID or email already exists" });
        }
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ success: false, error: error.message });
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
        if (error.name === 'CastError') return res.status(400).json({ success: false, error: "Invalid employee ID" });
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
    const newFilePath = req.file ? path.join(uploadDir, req.file.filename) : null;
    let oldPic = null;
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            if (newFilePath && fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
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

        if (email !== undefined) {
            const norm = String(email).toLowerCase().trim();
            const dup = await User.findOne({ email: norm, _id: { $ne: employee.userId } });
            if (dup) {
                if (newFilePath && fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
                return res.status(400).json({ success: false, error: "Email already exists" });
            }
        }
        if (employeeId !== undefined) {
            const dupEmp = await Employee.findOne({ employeeId: String(employeeId).trim(), _id: { $ne: employee._id } });
            if (dupEmp) {
                if (newFilePath && fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
                return res.status(400).json({ success: false, error: "Employee ID already exists" });
            }
        }
        if (department !== undefined && department !== "" && !/^[0-9a-fA-F]{24}$/.test(department)) {
            if (newFilePath && fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
            return res.status(400).json({ success: false, error: "Invalid department ID" });
        }
        if (salary !== undefined && salary !== "") {
            const n = Number(salary);
            if (!Number.isFinite(n) || n < 0) {
                if (newFilePath && fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
                return res.status(400).json({ success: false, error: "Invalid salary" });
            }
        }

        if (employee.userId) {
            const user = await User.findById(employee.userId);
            if (user) {
                if (name !== undefined) user.name = String(name).trim();
                if (email !== undefined) user.email = String(email).toLowerCase().trim();
                if (role !== undefined) user.role = role;
                if (req.file) {
                    oldPic = user.profilePicture;
                    user.profilePicture = req.file.filename;
                }
                if (password && String(password).trim() !== "") {
                    user.password = String(password).trim();
                }
                await user.save();
                if (oldPic && req.file) {
                    const oldPath = path.join(uploadDir, oldPic);
                    try { if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); } catch {}
                }
            }
        }

        if (employeeId !== undefined && String(employeeId).trim() !== "") employee.employeeId = String(employeeId).trim();
        if (dob !== undefined) employee.dob = dob;
        if (gender !== undefined) employee.gender = gender;
        if (maritalStatus !== undefined) employee.maritalStatus = maritalStatus;
        if (placeOfBirth !== undefined) employee.placeOfBirth = String(placeOfBirth).trim();
        if (department !== undefined && department !== "") employee.department = department;
        if (salary !== undefined && salary !== "") employee.salary = Number(salary);
        await employee.save();

        return res.status(200).json({ success: true, message: "Employee updated successfully" });
    } catch (error) {
        console.log('UPDATE EMPLOYEE ERROR:', error);
        if (newFilePath && fs.existsSync(newFilePath)) {
            try { fs.unlinkSync(newFilePath); } catch {}
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: "Employee ID already exists" });
        }
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ success: false, error: error.message });
        }
        return res.status(500).json({ success: false, error: "update employee server error" });
    }
}

const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }
        const user = employee.userId ? await User.findById(employee.userId) : null;
        const pic = user?.profilePicture;

        await Employee.findByIdAndDelete(req.params.id);
        if (employee.userId) await User.findByIdAndDelete(employee.userId);
        await Salary.deleteMany({ employeeId: employee._id });
        await Leave.deleteMany({ employeeId: employee._id });
        if (pic) {
            const picPath = path.join(uploadDir, pic);
            try { if (fs.existsSync(picPath)) fs.unlinkSync(picPath); } catch {}
        }
        return res.status(200).json({ success: true, message: "Employee deleted successfully" });
    } catch (error) {
        console.log('DELETE EMPLOYEE ERROR:', error);
        if (error.name === 'CastError') return res.status(400).json({ success: false, error: "Invalid employee ID" });
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

const updateMyProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No image file uploaded" });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (user.profilePicture) {
            const oldPath = path.join(uploadDir, user.profilePicture);
            try {
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            } catch (e) {
                console.log('OLD PROFILE PICTURE DELETE FAILED:', e.message);
            }
        }

        user.profilePicture = req.file.filename;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        console.log('UPDATE MY PROFILE PICTURE ERROR:', error);
        return res.status(500).json({ success: false, error: "update profile picture server error" });
    }
};

export { addEmployee, getEmployees, getEmployee, getMyProfile, updateEmployee, deleteEmployee, upload , fetchEmployeesByDepId, updateMyProfilePicture};
