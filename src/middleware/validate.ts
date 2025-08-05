import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { ApiError } from "../utils/errors";

export const validate = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error: any) {
            next(new ApiError(error.errors || "Validation error", 400));
        }
    };
};
