"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentSchema = exports.appointmentSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
exports.createAppointmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Title is required"),
        description: zod_1.z.string().optional(),
        date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
        }),
        time: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
        duration: zod_1.z.number().int().positive("Duration must be a positive integer"),
        clientName: zod_1.z.string().min(1, "Client name is required"),
        clientEmail: zod_1.z.string().email("Invalid email format"),
        clientPhone: zod_1.z.string().optional(),
        status: zod_1.z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
    }),
});
exports.appointmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Appointment ID is required"),
    }),
});
// export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
//     params: z.object({
//         id: z.string().min(1, "Appointment ID is required"),
//     }),
// });
// Make all body fields optional for update
exports.updateAppointmentSchema = zod_1.z.object({
    body: exports.createAppointmentSchema.shape.body.partial(),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Appointment ID is required"),
    }),
});
