import { z } from "zod";

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format").nonempty("Email is required"),
        // password: z.string().min(6, "Password must be at least 6 characters long"),
        password: z.string(),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format").nonempty("Email is required"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        firstName: z
            .string()
            .min(2, "First name must be at least 2 characters long")
            .max(50, "First name must not exceed 50 characters"),
        lastName: z
            .string()
            .min(2, "Last name must be at least 2 characters long")
            .max(50, "Last name must not exceed 50 characters"),
        phone: z
            .string()
            .regex(
                /^[0-9+\-\s()]+$/,
                "Phone number can only contain digits, spaces, and special characters +, -, ( )"
            )
            .optional(),
    }),
});
