import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
    if (!process.env.MONGODB_URL) {
        throw new Error('MONGODB_URL not set');
    }
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 15000,
            maxPoolSize: 10,
        });
        connectionPromise.catch((err) => {
            console.log('MONGOOSE CONNECT FAILED:', err.message);
            connectionPromise = null;
        });
    }
    return connectionPromise;
};

export default connectDB;
