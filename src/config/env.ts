import dotenv from "dotenv";

dotenv.config(); 

export const ENV = {
    PORT: process.env.PORT || 4000,
    MONGODB_URI: process.env.MONGODB_URI || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    API_KEY: process.env.API_KEY || ""
};
