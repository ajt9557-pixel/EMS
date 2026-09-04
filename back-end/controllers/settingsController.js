import bcrypt from "bcryptjs";
import User from "../models/User.mjs";
const changePassword = async (req,res ) => {
    try{
        const {userID, oldPassword, newPassword} = req.body;
        const user = await User.findById(userID);
        if(!user){
            return res.status(404).json({ success: false, error: "User not found" });
        }
         const isMatch = await bcrypt.compare(oldPassword, user.password);
         if(!isMatch){
            return res.status(404).json({ success: false, error: "Wrong old password" });

         }
        
         const hashPassword = await bcrypt.hash(newPassword, 10);
         user.password = hashPassword;
         await user.save();
         return res.status(200).json({ success: true, message: "Password changed successfully" });

    }catch(error){
        console.log('CHANGE PASSWORD ERROR:', error);
        return res.status(500).json({ success: false, error: "change password server error" });
    }
}
export {changePassword}