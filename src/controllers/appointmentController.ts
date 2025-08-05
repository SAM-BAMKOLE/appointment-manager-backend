import { Request, Response, NextFunction } from "express";
import { AppointmentService } from "../services/appointmentService";
import { handleAsync } from "../utils/errors";
import { RequestWithUser } from "../types";
import { Appointment } from "@prisma/client";

export class AppointmentController {
    static createAppointment = handleAsync(async (req: RequestWithUser, res: Response) => {
        const appointmentData = {
            ...req.body,
            userId: req.user!.id,
        };
        const appointment = await AppointmentService.createAppointment(appointmentData);
        res.status(201).json({ success: true, data: appointment });
    });

    static getAppointment = handleAsync(async (req: RequestWithUser, res: Response) => {
        const appointment = await AppointmentService.getAppointmentById(req.params.id);
        if (appointment.userId !== req.user?.id && req.user?.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "You are not authorized to access this appointment",
            });
        }

        return res.status(200).json({ success: true, data: appointment });
    });

    static getAllAppointments = handleAsync(async (req: RequestWithUser, res: Response) => {
        const appointments = await AppointmentService.getAllAppointments(
            req.user!.id,
            req.user!.role
        );
        res.status(200).json({ success: true, data: appointments });
    });

    static updateAppointment = handleAsync(async (req: RequestWithUser, res: Response) => {
        const appointment = await AppointmentService.updateAppointment(
            req.params.id,
            req.user!.id,
            req.user!.role,
            req.body
        );
        res.status(200).json({ success: true, data: appointment });
    });

    static deleteAppointment = handleAsync(async (req: RequestWithUser, res: Response) => {
        await AppointmentService.deleteAppointment(req.params.id, req.user!.id, req.user!.role);
        res.status(204).json({ success: true });
    });
}
