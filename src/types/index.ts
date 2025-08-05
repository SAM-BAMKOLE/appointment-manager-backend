import { Request } from "express";

export interface Appointment {
    id: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    duration: number;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    status: "scheduled" | "completed" | "cancelled";
    createdAt: string;
    updatedAt: string;
}

export interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

export interface RequestWithUser extends Request {
    user?: JwtPayload;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any[];
}
