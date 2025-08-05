require("dotenv").config();
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JwtPayload } from "../types";

export const generateAccessToken = (payload: JwtPayload): string => {
    // @ts-ignore
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d",
    });
};
export const generateRefreshToken = (payload: JwtPayload): string => {
    // @ts-ignore
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
};

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 12);
};

export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateRandomToken = (): string => {
    return (
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
};
