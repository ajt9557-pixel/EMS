import User from './models/User.mjs';
import bcrypt from 'bcryptjs';
import connectDB from './db/db.mjs';
const userRegister = async () => { 
    await connectDB();
 
    try{
        const hashPassword = await bcrypt.hash("Admin123", 10);
        const newUser = new User({
            name: "Admin",
            email: "Admin@example.com",
            password: hashPassword,
            role: "admin"
        });
        await newUser.save();
    }
    catch(error){
        console.log(error);
    }
}

userRegister();
