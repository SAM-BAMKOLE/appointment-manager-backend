"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const appointmentSchema_1 = require("../schemas/appointmentSchema");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router
    .route("/")
    .post((0, validate_1.validate)(appointmentSchema_1.createAppointmentSchema), (0, auth_1.authorize)("user", "admin"), appointmentController_1.AppointmentController.createAppointment)
    .get((0, auth_1.authorize)("user", "admin"), appointmentController_1.AppointmentController.getAllAppointments);
router
    .route("/:id")
    .get((0, validate_1.validate)(appointmentSchema_1.appointmentSchema), (0, auth_1.authorize)("user", "admin"), appointmentController_1.AppointmentController.getAppointment)
    .patch((0, validate_1.validate)(appointmentSchema_1.updateAppointmentSchema), (0, auth_1.authorize)("user", "admin"), appointmentController_1.AppointmentController.updateAppointment)
    .delete((0, validate_1.validate)(appointmentSchema_1.appointmentSchema), (0, auth_1.authorize)("user", "admin"), appointmentController_1.AppointmentController.deleteAppointment);
exports.default = router;
