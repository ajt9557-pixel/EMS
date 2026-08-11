import jwt from "jsonwebtoken";
import User from "../models/User.mjs";
import connectDB from "../db/db.mjs";

const verifyuser = async (req, res, next) => {
    try {
        await connectDB();
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(404).json({success: false, error: "no token found"});
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(404).json({success: false, error: "no token found"});
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) {
            return res.status(404).json({success: false, error: "token not valid"});
        }

        const foundUser = await User.findById(decoded.id).select('-password');
        if (!foundUser) {
            return res.status(404).json({success: false, error: "no user"});
        }

        req.user = foundUser;
        next();
    } catch (error) {
        console.log('MIDDLEWARE ERROR:', error);
        return res.status(500).json({success: false, error: "server error"});
    }
}

export default verifyuser