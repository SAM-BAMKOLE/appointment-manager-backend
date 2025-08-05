import { NextFunction, Request, Response } from "express";
import { ZodIssue } from "zod";

export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    issues?: ZodIssue[];

    constructor(message: string | ZodIssue[], statusCode: number) {
        if (Array.isArray(message)) {
            super("Validation error");
            this.issues = message;
        } else {
            super(message);
        }
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const handleAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
