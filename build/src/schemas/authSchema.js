"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format").nonempty("Email is required"),
        // password: z.string().min(6, "Password must be at least 6 characters long"),
        password: zod_1.z.string(),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format").nonempty("Email is required"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
        firstName: zod_1.z
            .string()
            .min(2, "First name must be at least 2 characters long")
            .max(50, "First name must not exceed 50 characters"),
        lastName: zod_1.z
            .string()
            .min(2, "Last name must be at least 2 characters long")
            .max(50, "Last name must not exceed 50 characters"),
        phone: zod_1.z
            .string()
            .regex(/^[0-9+\-\s()]+$/, "Phone number can only contain digits, spaces, and special characters +, -, ( )")
            .optional(),
    }),
});
