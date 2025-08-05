import { z } from "zod";

export const createAppointmentSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        date: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
        }),
        time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
        duration: z.number().int().positive("Duration must be a positive integer"),
        clientName: z.string().min(1, "Client name is required"),
        clientEmail: z.string().email("Invalid email format"),
        clientPhone: z.string().optional(),
        status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
    }),
});

export const appointmentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Appointment ID is required"),
    }),
});

// export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
//     params: z.object({
//         id: z.string().min(1, "Appointment ID is required"),
//     }),
// });

// Make all body fields optional for update
export const updateAppointmentSchema = z.object({
    body: createAppointmentSchema.shape.body.partial(),
    params: z.object({
        id: z.string().min(1, "Appointment ID is required"),
    }),
});
