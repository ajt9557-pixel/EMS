import User from './models/User.mjs';
import bcrypt from 'bcryptjs';
import connectDB from './db/db.mjs';
const userRegister = async () => { 
    await connectDB();
 
    try{
        // Use plain password - User schema pre('save') hashes it once. Previously double-hashed.
        const existing = await User.findOne({email: "admin@example.com"});
        if (existing) {
            console.log("Admin already exists:", existing.email);
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
    }
}

userRegister();
