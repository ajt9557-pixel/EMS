import bcrypt from "bcryptjs";
import User from "../models/User.mjs";
const changePassword = async (req,res ) => {
    try{
        const {userId, userID, oldPassword, newPassword} = req.body;
        const targetId = userId || userID || req.user?._id;
        const user = await User.findById(targetId);
        if(!user){
            return res.status(404).json({ success: false, error: "User not found" });
        }
         if (!oldPassword || !newPassword) return res.status(400).json({ success: false, error: "oldPassword and newPassword required" });
         if (newPassword.length < 6) return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
         const isMatch = await bcrypt.compare(oldPassword, user.password);
         if(!isMatch){
            return res.status(400).json({ success: false, error: "Wrong old password" });
         }
        
          user.password = newPassword;
          await user.save();
          return res.status(200).json({ success: true, message: "Password changed successfully" });

    }catch(error){
        console.log('CHANGE PASSWORD ERROR:', error);
        return res.status(500).json({ success: false, error: "change password server error" });
    }
}
export {changePassword}