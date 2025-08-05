import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/errors";
import { config } from "../config/env";
import { RequestWithUser } from "../types";
import { verifyAccessToken } from "../utils/auth";

// export const verifyToken = (token: string) => {
//     return jwt.verify(token, config.jwtSecret) as { id: string; role: string; email: string };
// };

export const authenticate = (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new ApiError("Access token required", 401);
        }

        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        next(new ApiError("Invalid token", 401));
    }
};

export const authorize = (...roles: string[]) => {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError("Authentication required", 403));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ApiError("Insufficient permissions", 403));
        }

        next();
    };
};
