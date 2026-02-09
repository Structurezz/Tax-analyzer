import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Example: simple API key auth
    const apiKey = req.headers["x-api-key"];
    if (apiKey === process.env.API_KEY) return next();
    res.status(401).json({ error: "Unauthorized" });
};
