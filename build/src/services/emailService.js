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
exports.sendEmail = sendEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
require("dotenv").config();
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../config/logger"));
function createTransport() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.NODE_ENV === "development") {
            const testAccount = yield nodemailer_1.default.createTestAccount();
            const transporter = nodemailer_1.default.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            return transporter;
        }
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT === "406" ? true : false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        return transporter;
    });
}
// TODO: Allow add name to sent data
function sendEmail(to, subject, html) {
    return __awaiter(this, void 0, void 0, function* () {
        const transporter = yield createTransport();
        if (process.env.OFFLINE_MODE === "true") {
            const info = yield transporter.sendMail({
                from: process.env.FROM_EMAIL,
                to,
                subject,
                html,
            });
            console.log(info.messageId);
            console.log("Mail Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
            logger_1.default.info(`Email sent to ${to}`);
            return;
        }
        try {
            yield transporter.sendMail({
                from: "Backend<" + process.env.FROM_EMAIL + ">",
                to,
                subject,
                html,
            });
            logger_1.default.info(`Email sent to ${to}`);
        }
        catch (error) {
            logger_1.default.error("Error sending email:", error);
            //@ts-ignore
            error.message = "Error sending email";
            throw error;
        }
    });
}
function sendPasswordResetEmail(email, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const html = `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `;
        yield sendEmail(email, "Reset Your Password", html);
    });
}
