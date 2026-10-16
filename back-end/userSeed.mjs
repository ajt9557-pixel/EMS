import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.mjs';
import connectDB from './db/db.mjs';
const userRegister = async () => { 
    try{
        await connectDB();
        // Use plain password - User schema pre('save') hashes it once. Previously double-hashed.
        const existing = await User.findOne({email: "admin@example.com"});
        if (existing) {
            // Reset password to Admin123 on every seed run (pre-save hook hashes it).
            existing.password = "Admin123";
            existing.role = "admin";
            await existing.save();
            console.log("Admin password reset to Admin123:", existing.email);
            return;
        }
        const newUser = new User({
            name: "Admin",
            email: "admin@example.com",
            password: "Admin123",
            role: "admin"
        });
        await newUser.save();
        console.log("Admin created:", newUser.email);
    }
    catch(error){
        console.log(error);
        process.exitCode = 1;
    }
    finally {
        await mongoose.disconnect();
    }
}

userRegister();
