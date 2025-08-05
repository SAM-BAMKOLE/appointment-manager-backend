import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors";
import logger from "../config/logger";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    let error: Partial<ApiError> = { ...err };
    error.message = err.message;

    // Log error
    logger.error(err);

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = "Resource not found";
        error = new ApiError(message, 404);
    }

    // Mongoose duplicate key
    if (err.name === "MongoError" && (err as any).code === 11000) {
        const message = "Duplicate field value entered";
        error = new ApiError(message, 400);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values((err as any).errors).map((val: any) => val.message);
        error = new ApiError(message.join(", "), 400);
    }

    res.status((error as ApiError).statusCode || 500).json({
        success: false,
        message: error.issues ? error.issues : error.message || "Server Error",
    });
};
