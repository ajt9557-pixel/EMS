import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 15000,
        });
        connectionPromise.catch(() => {
            connectionPromise = null;
        });
    }
    return connectionPromise;
};

export default connectDB;
