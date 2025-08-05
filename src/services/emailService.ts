require("dotenv").config();
import nodemailer from "nodemailer";
import logger from "../config/logger";

async function createTransport() {
    if (process.env.NODE_ENV === "development") {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
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
    const transporter: nodemailer.Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "406" ? true : false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    return transporter;
}

// TODO: Allow add name to sent data
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
    const transporter = await createTransport();

    if (process.env.OFFLINE_MODE === "true") {
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to,
            subject,
            html,
        });
        console.log(info.messageId);
        console.log("Mail Preview URL: %s", nodemailer.getTestMessageUrl(info));
        logger.info(`Email sent to ${to}`);
        return;
    }
    try {
        await transporter.sendMail({
            from: "Backend<" + process.env.FROM_EMAIL + ">",
            to,
            subject,
            html,
        });
        logger.info(`Email sent to ${to}`);
    } catch (error) {
        logger.error("Error sending email:", error);
        //@ts-ignore
        error.message = "Error sending email";
        throw error;
    }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `;
    await sendEmail(email, "Reset Your Password", html);
}
