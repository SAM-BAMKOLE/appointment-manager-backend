import { Router } from "express";
import { AppointmentController } from "../controllers/appointmentController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
    createAppointmentSchema,
    appointmentSchema,
    updateAppointmentSchema,
} from "../schemas/appointmentSchema";

const router = Router();

router.use(authenticate);

router
    .route("/")
    .post(
        validate(createAppointmentSchema),
        authorize("user", "admin"),
        AppointmentController.createAppointment
    )
    .get(authorize("user", "admin"), AppointmentController.getAllAppointments);

router
    .route("/:id")
    .get(
        validate(appointmentSchema),
        authorize("user", "admin"),
        AppointmentController.getAppointment
    )
    .patch(
        validate(updateAppointmentSchema),
        authorize("user", "admin"),
        AppointmentController.updateAppointment
    )
    .delete(
        validate(appointmentSchema),
        authorize("user", "admin"),
        AppointmentController.deleteAppointment
    );

export default router;
