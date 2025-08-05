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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointmentService_1 = require("../services/appointmentService");
const errors_1 = require("../utils/errors");
class AppointmentController {
}
exports.AppointmentController = AppointmentController;
_a = AppointmentController;
AppointmentController.createAppointment = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentData = Object.assign(Object.assign({}, req.body), { userId: req.user.id });
    const appointment = yield appointmentService_1.AppointmentService.createAppointment(appointmentData);
    res.status(201).json({ success: true, data: appointment });
}));
AppointmentController.getAppointment = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const appointment = yield appointmentService_1.AppointmentService.getAppointmentById(req.params.id);
    if (appointment.userId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
        return res.status(401).json({
            success: false,
            message: "You are not authorized to access this appointment",
        });
    }
    return res.status(200).json({ success: true, data: appointment });
}));
AppointmentController.getAllAppointments = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const appointments = yield appointmentService_1.AppointmentService.getAllAppointments(req.user.id, req.user.role);
    res.status(200).json({ success: true, data: appointments });
}));
AppointmentController.updateAppointment = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const appointment = yield appointmentService_1.AppointmentService.updateAppointment(req.params.id, req.user.id, req.user.role, req.body);
    res.status(200).json({ success: true, data: appointment });
}));
AppointmentController.deleteAppointment = (0, errors_1.handleAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield appointmentService_1.AppointmentService.deleteAppointment(req.params.id, req.user.id, req.user.role);
    res.status(204).json({ success: true });
}));
