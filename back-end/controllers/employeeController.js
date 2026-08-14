import Employee from "../models/employeeModel.js";
import User from "../models/User.mjs";
import User from "../models/User.mjs";
import bcrypt from "bcryptjs";
import multer from "multer";

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, "public/uploads")
    },
    filename:(req, file, cb) => {
        cb(null, Date.now() + "-" + path.extname(file.originalname))
    }

})

const upload = multer({storage: storage})

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

        const User = await User.findOne({email})
        if (User) {
           return res.status(400).json({success: false, error: "User already exists"});
        }

        const  hashpassword = await bcrypt.hash(password, 10)

        const newUser = newUser({
            name,
            email,
            prifileImage: req.file ? req.file.filename : "",
            password: hashpassword,
            role,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        await newUser.save();
        res.status(200).json({success: true, message: "Employee added successfully"});

        const newEmployee = new Employee({
            userID: savedUser._id,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        await newEmployee.save();
        res.status(200).json({success: true, message: "Employee added successfully"});
    } catch (error) {
        console.log('ADD EMPLOYEE ERROR:', error);
        res.status(500).json({success: false, error: "add employee server error"});
    }
}

export  {addEmployee, upload}