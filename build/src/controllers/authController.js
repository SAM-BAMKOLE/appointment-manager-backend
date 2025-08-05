"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecuritySettings = exports.disableTwoFactor = exports.enableTwoFactor = exports.getTwoFactorStatus = exports.updateEmailPreferences = exports.getLoginHistory = exports.checkEmailAvailability = exports.deleteAccount = exports.reactivateAccount = exports.deactivateAccount = exports.logout = exports.refreshToken = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const auth_1 = require("../utils/auth");
const errors_1 = require("../utils/errors");
const emailService_1 = require("../services/emailService");
exports.register = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, phone, role } = req.body;
    const userRole = role === "admin" ? "admin" : "user";
    // Check if user already exists
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new errors_1.ApiError("User already exists with this email", 400);
    }
    // Hash password
    const hashedPassword = yield (0, auth_1.hashPassword)(password);
    // Generate email verification token
    // const emailVerifyToken = generateRandomToken();
    // Create user
    const user = yield prisma_1.default.user.create({
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
}));
exports.login = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Check if user exists
    const user = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new errors_1.ApiError("Invalid credentials", 404);
    }
    // Check if user is active
    if (!user.isActive) {
        throw new errors_1.ApiError("Account is deactivated", 403);
    }
    // Check password
    const isPasswordValid = yield (0, auth_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new errors_1.ApiError("Invalid credentials", 403);
    }
    // Generate token
    const accessToken = (0, auth_1.generateAccessToken)({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    const refreshToken = (0, auth_1.generateRefreshToken)({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    yield prisma_1.default.user.update({
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
}));
exports.getProfile = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: req.user.id },
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
        throw new errors_1.ApiError("User not found", 404);
    }
    res.json({
        success: true,
        data: { user },
    });
}));
// Request<{}, {}, { firstName: string, lastName: string, phone: string }>
exports.updateProfile = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, phone } = req.body;
    const user = yield prisma_1.default.user.update({
        where: { id: req.user.id },
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
}));
exports.forgotPassword = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        // Don't reveal that user doesn't exist
        return res.json({
            success: true,
            message: "If an account with that email exists, we sent a password reset link.",
        });
    }
    const resetToken = (0, auth_1.generateRandomToken)();
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    yield prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
        },
    });
    yield (0, emailService_1.sendPasswordResetEmail)(email, resetToken);
    res.json({
        success: true,
        message: "Password reset link sent to your email",
    });
}));
exports.resetPassword = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    if (!token || !password) {
        throw new errors_1.ApiError("Token and password are required", 400);
    }
    const user = yield prisma_1.default.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: {
                gt: new Date(),
            },
        },
    });
    if (!user) {
        throw new errors_1.ApiError("Invalid or expired reset token", 400);
    }
    // Hash new password
    const hashedPassword = yield (0, auth_1.hashPassword)(password);
    // Update user with new password and clear reset token
    yield prisma_1.default.user.update({
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
}));
exports.changePassword = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new errors_1.ApiError("Current password and new password are required", 400);
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        throw new errors_1.ApiError("User not found", 404);
    }
    // Verify current password
    const isCurrentPasswordValid = yield (0, auth_1.comparePassword)(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new errors_1.ApiError("Current password is incorrect", 400);
    }
    // Hash new password
    const hashedNewPassword = yield (0, auth_1.hashPassword)(newPassword);
    // Update password
    yield prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            password: hashedNewPassword,
        },
    });
    res.json({
        success: true,
        message: "Password changed successfully",
    });
}));
exports.refreshToken = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new errors_1.ApiError("No token provided", 403);
    }
    const payload = (0, auth_1.verifyRefreshToken)(refreshToken);
    const user = yield prisma_1.default.user.findUnique({
        where: { id: payload.id },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
        },
    });
    if (!user || !user.isActive) {
        throw new errors_1.ApiError("User not found or inactive", 404);
    }
    // Generate new token
    const accessToken = (0, auth_1.generateAccessToken)({
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
}));
exports.logout = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // In a stateless JWT system, logout is typically handled client-side
    // However, we can implement token blacklisting if needed
    // For now, we'll just return a success message
    res.json({
        success: true,
        message: "Logged out successfully",
    });
}));
exports.deactivateAccount = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    if (!password) {
        throw new errors_1.ApiError("Password is required to deactivate account", 400);
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        throw new errors_1.ApiError("User not found", 404);
    }
    // Verify password
    const isPasswordValid = yield (0, auth_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new errors_1.ApiError("Invalid password", 400);
    }
    // Deactivate account
    yield prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            isActive: false,
        },
    });
    res.json({
        success: true,
        message: "Account deactivated successfully",
    });
}));
exports.reactivateAccount = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errors_1.ApiError("Email and password are required", 400);
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new errors_1.ApiError("User not found", 404);
    }
    if (user.isActive) {
        throw new errors_1.ApiError("Account is already active", 400);
    }
    // Verify password
    const isPasswordValid = yield (0, auth_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new errors_1.ApiError("Invalid password", 400);
    }
    // Reactivate account
    yield prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            isActive: true,
        },
    });
    res.json({
        success: true,
        message: "Account reactivated successfully",
    });
}));
exports.deleteAccount = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, confirmation } = req.body;
    if (!password || !confirmation) {
        throw new errors_1.ApiError("Password and confirmation are required", 400);
    }
    if (confirmation !== "DELETE_MY_ACCOUNT") {
        throw new errors_1.ApiError('Invalid confirmation. Please type "DELETE_MY_ACCOUNT"', 400);
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        throw new errors_1.ApiError("User not found", 404);
    }
    // Verify password
    const isPasswordValid = yield (0, auth_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new errors_1.ApiError("Invalid password", 400);
    }
    // Soft delete - just deactivate the account
    // In a real application, you might want to anonymize the data instead
    yield prisma_1.default.user.update({
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
}));
exports.checkEmailAvailability = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    if (!email) {
        throw new errors_1.ApiError("Email is required", 400);
    }
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { email: email },
    });
    res.json({
        success: true,
        data: {
            available: !existingUser,
        },
    });
}));
exports.getLoginHistory = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This would require a separate login history table in a real application
    // For now, we'll just return the user's account creation and last update
    const user = yield prisma_1.default.user.findUnique({
        where: { id: req.user.id },
        select: {
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new errors_1.ApiError("User not found", 404);
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
}));
exports.updateEmailPreferences = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.getTwoFactorStatus = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This would require 2FA fields in the user model
    // For now, we'll just return that 2FA is not enabled
    res.json({
        success: true,
        data: {
            twoFactorEnabled: false,
            backupCodesGenerated: false,
        },
    });
}));
exports.enableTwoFactor = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.disableTwoFactor = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, twoFactorCode } = req.body;
    if (!password) {
        throw new errors_1.ApiError("Password is required", 400);
    }
    // Verify password and 2FA code (implementation would go here)
    res.json({
        success: true,
        message: "Two-factor authentication disabled successfully",
    });
}));
exports.getSecuritySettings = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: req.user.id },
        select: {
            // isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new errors_1.ApiError("User not found", 404);
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
}));
