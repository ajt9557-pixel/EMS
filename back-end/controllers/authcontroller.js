import { json } from 'express';
import User from '../models/User.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    console.log('LOGIN REQUEST RECEIVED', req.body);
    try {
        const {email, password} = req.body;
        console.log('Looking up user...');
        const user = await User.findOne({email});
        console.log('User lookup done:', user);
        if(!user){
            return res.status(404).json({success:false,error:"user not found"});
        }

        const ismatch = await bcrypt.compare(password, user.password);
        if(!ismatch){
            return res.status(400).json({success:false,error:"invalid credentials"});
        }
        const tokken = jwt.sign({id: user._id, role: user.role}, process.env.JWT_KEY, {expiresIn: "10d"});
        res.status(200).json({success:true, tokken, user: {_id: user._id, name: user.name, email: user.email, role: user.role}});
    }catch(error){
        console.log('ERROR:', error);
        res.status(500).json({success:false, error: "server error"});
    }
}

const verify = (req, res) => {
    res.status(200).json({success: true, user: req.user});
}

export {login, verify};