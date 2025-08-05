import prisma from "../config/prisma";
import { Appointment } from "../types";
import { ApiError } from "../utils/errors";

interface CreateAppointmentData extends Omit<Appointment, "id" | "createdAt" | "updatedAt"> {
    userId: string;
}

export class AppointmentService {
    static async createAppointment(data: CreateAppointmentData) {
        return prisma.appointment.create({
            data,
        });
    }

    static async getAppointmentById(id: string) {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!appointment) {
            throw new ApiError("Appointment not found", 404);
        }

        return appointment;
    }

    static async getAllAppointments(userId: string, role: string) {
        if (role === "admin") {
            return prisma.appointment.findMany({
                orderBy: { createdAt: "desc" },
            });
        }

        return prisma.appointment.findMany({
            where: { userId: userId },
            orderBy: { createdAt: "desc" },
        });
    }

    static async updateAppointment(
        id: string,
        userId: string,
        role: string,
        data: Partial<Appointment>
    ) {
        const appointment = await this.getAppointmentById(id);

        if (role !== "admin" && appointment.userId !== userId) {
            throw new ApiError("Unauthorized to update this appointment", 403);
        }

        return prisma.appointment.update({
            where: { id },
            data,
        });
    }

    static async deleteAppointment(id: string, userId: string, role: string) {
        const appointment = await this.getAppointmentById(id);

        if (role !== "admin" && appointment.userId !== userId) {
            throw new ApiError("Unauthorized to delete this appointment", 403);
        }

        return prisma.appointment.delete({
            where: { id },
        });
    }
}
