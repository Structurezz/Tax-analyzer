import mongoose from "mongoose";
import { ENV } from "./env.js"; // Use centralized env variables

const mongoUrl = ENV.MONGODB_URI || "";

export const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl);
        console.log("MongoDB connected successfully");
    } catch (err: any) {
        console.error("MongoDB connection error:", err.message || err);
        process.exit(1);
    }
};
