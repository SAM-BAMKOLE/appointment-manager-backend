import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRandomToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/auth";
import { ApiError, handleAsync } from "../utils/errors";
import { RequestWithUser } from "../types";
import { sendPasswordResetEmail } from "../services/emailService";

export const register = handleAsync(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, phone, role } = req.body;

    const userRole = role === "admin" ? "admin" : "user";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ApiError("User already exists with this email", 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    // const emailVerifyToken = generateRandomToken();

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role: userRole,
        },
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        },
    });
});

export const login = handleAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError("Invalid credentials", 404);
    }

    // Check if user is active
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid credentials", 403);
    }

    // Generate token
    const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
        success: true,
        message: "Login successful",
        data: {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        },
    });
});

export const getProfile = handleAsync(async (req: RequestWithUser, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    res.json({
        success: true,
        data: { user },
    });
});

interface RequestAndUser extends RequestWithUser {
    body: { firstName: string; lastName: string; phone: string };
}
// Request<{}, {}, { firstName: string, lastName: string, phone: string }>
export const updateProfile = handleAsync(async (req: RequestAndUser, res: Response) => {
    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
            firstName,
            lastName,
            phone,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
        },
    });

    res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
    });
});

export const forgotPassword = handleAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        // Don't reveal that user doesn't exist
        return res.json({
            success: true,
            message: "If an account with that email exists, we sent a password reset link.",
        });
    }

    const resetToken = generateRandomToken();
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
        },
    });

    await sendPasswordResetEmail(email, resetToken);

    res.json({
        success: true,
        message: "Password reset link sent to your email",
    });
});

export const resetPassword = handleAsync(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    if (!token || !password) {
        throw new ApiError("Token and password are required", 400);
    }

    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: {
                gt: new Date(),
            },
        },
    });

    if (!user) {
        throw new ApiError("Invalid or expired reset token", 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user with new password and clear reset token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        },
    });

    res.json({
        success: true,
        message: "Password reset successfully",
    });
});

export const changePassword = handleAsync(async (req: RequestWithUser, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError("Current password and new password are required", 400);
    }

    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new ApiError("Current password is incorrect", 400);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedNewPassword,
        },
    });

    res.json({
        success: true,
        message: "Password changed successfully",
    });
});

export const refreshToken = handleAsync(async (req: RequestWithUser, res: Response) => {
    const refreshToken: string | undefined = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new ApiError("No token provided", 403);
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
        },
    });

    if (!user || !user.isActive) {
        throw new ApiError("User not found or inactive", 404);
    }

    // Generate new token
    const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        },
    });
});

export const logout = handleAsync(async (req: RequestWithUser, res: Response) => {
    // In a stateless JWT system, logout is typically handled client-side
    // However, we can implement token blacklisting if needed
    // For now, we'll just return a success message
    res.json({
        success: true,
        message: "Logged out successfully",
    });
});

export const deactivateAccount = handleAsync(async (req: RequestWithUser, res: Response) => {
    const { password } = req.body;

    if (!password) {
        throw new ApiError("Password is required to deactivate account", 400);
    }

    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid password", 400);
    }

    // Deactivate account
    await prisma.user.update({
        where: { id: user.id },
        data: {
            isActive: false,
        },
    });

    res.json({
        success: true,
        message: "Account deactivated successfully",
    });
});

export const reactivateAccount = handleAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    if (user.isActive) {
        throw new ApiError("Account is already active", 400);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid password", 400);
    }

    // Reactivate account
    await prisma.user.update({
        where: { id: user.id },
        data: {
            isActive: true,
        },
    });

    res.json({
        success: true,
        message: "Account reactivated successfully",
    });
});

export const deleteAccount = handleAsync(async (req: RequestWithUser, res: Response) => {
    const { password, confirmation } = req.body;

    if (!password || !confirmation) {
        throw new ApiError("Password and confirmation are required", 400);
    }

    if (confirmation !== "DELETE_MY_ACCOUNT") {
        throw new ApiError('Invalid confirmation. Please type "DELETE_MY_ACCOUNT"', 400);
    }

    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid password", 400);
    }

    // Soft delete - just deactivate the account
    // In a real application, you might want to anonymize the data instead
    await prisma.user.update({
        where: { id: user.id },
        data: {
            isActive: false,
            email: `deleted_${user.id}@deleted.com`,
            firstName: "Deleted",
            lastName: "User",
            phone: null,
        },
    });

    res.json({
        success: true,
        message: "Account deleted successfully",
    });
});

export const checkEmailAvailability = handleAsync(async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email) {
        throw new ApiError("Email is required", 400);
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: email as string },
    });

    res.json({
        success: true,
        data: {
            available: !existingUser,
        },
    });
});

export const getLoginHistory = handleAsync(async (req: RequestWithUser, res: Response) => {
    // This would require a separate login history table in a real application
    // For now, we'll just return the user's account creation and last update
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    res.json({
        success: true,
        data: {
            loginHistory: [
                {
                    type: "Account Created",
                    timestamp: user.createdAt,
                    ipAddress: "N/A",
                    userAgent: "N/A",
                },
                {
                    type: "Last Activity",
                    timestamp: user.updatedAt,
                    ipAddress: "N/A",
                    userAgent: "N/A",
                },
            ],
        },
    });
});

export const updateEmailPreferences = handleAsync(async (req: RequestWithUser, res: Response) => {
    // This would require email preferences fields in the user model
    // For now, we'll just return a success message
    const { marketingEmails, orderUpdates, securityAlerts } = req.body;

    // In a real application, you'd update these preferences in the database
    res.json({
        success: true,
        message: "Email preferences updated successfully",
        data: {
            preferences: {
                marketingEmails: marketingEmails || false,
                orderUpdates: orderUpdates !== false, // Default to true
                securityAlerts: securityAlerts !== false, // Default to true
            },
        },
    });
});

export const getTwoFactorStatus = handleAsync(async (req: RequestWithUser, res: Response) => {
    // This would require 2FA fields in the user model
    // For now, we'll just return that 2FA is not enabled
    res.json({
        success: true,
        data: {
            twoFactorEnabled: false,
            backupCodesGenerated: false,
        },
    });
});

export const enableTwoFactor = handleAsync(async (req: RequestWithUser, res: Response) => {
    // This would require implementing 2FA with libraries like speakeasy
    // For now, we'll just return a placeholder response
    res.json({
        success: true,
        message: "Two-factor authentication setup initiated",
        data: {
            qrCode: "placeholder-qr-code-url",
            backupCodes: ["123456", "234567", "345678", "456789", "567890"],
        },
    });
});

export const disableTwoFactor = handleAsync(async (req: RequestWithUser, res: Response) => {
    const { password, twoFactorCode } = req.body;

    if (!password) {
        throw new ApiError("Password is required", 400);
    }

    // Verify password and 2FA code (implementation would go here)

    res.json({
        success: true,
        message: "Two-factor authentication disabled successfully",
    });
});

export const getSecuritySettings = handleAsync(async (req: RequestWithUser, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
            // isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    res.json({
        success: true,
        data: {
            // emailVerified: user.isEmailVerified,
            twoFactorEnabled: false, // Would come from 2FA fields
            lastPasswordChange: user.updatedAt,
            accountCreated: user.createdAt,
            activeDevices: 1, // Would come from device tracking
        },
    });
});
