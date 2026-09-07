import User from '../models/User.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '../db/db.mjs';

const login = async (req, res) => {
    try {
        await connectDB();
        const {email, password} = req.body;
        if (!email?.trim() || !password) {
            return res.status(400).json({success:false,error:"email and password are required"});
        }
        const normalizedEmail = String(email).toLowerCase().trim();
        const user = await User.findOne({email: normalizedEmail});
        if(!user){
            return res.status(401).json({success:false,error:"invalid credentials"});
        }

        const ismatch = await bcrypt.compare(password, user.password);
        if(!ismatch){
            return res.status(401).json({success:false,error:"invalid credentials"});
        }
        if (!process.env.JWT_KEY) {
            return res.status(500).json({success:false,error:"server misconfigured"});
        }
        const tokken = jwt.sign({id: user._id, role: user.role}, process.env.JWT_KEY, {expiresIn: "1d"});
        const token = tokken;
        res.status(200).json({success:true, tokken, token, user: {_id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture}});
    }catch(error){
        console.log('ERROR:', error);
        res.status(500).json({success:false, error: "server error"});
    }
}

const verify = (req, res) => {
    res.status(200).json({success: true, user: req.user});
}

export {login, verify};