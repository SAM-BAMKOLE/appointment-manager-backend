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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
class AppointmentService {
    static createAppointment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.appointment.create({
                data,
            });
        });
    }
    static getAppointmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield prisma_1.default.appointment.findUnique({
                where: { id },
            });
            if (!appointment) {
                throw new errors_1.ApiError("Appointment not found", 404);
            }
            return appointment;
        });
    }
    static getAllAppointments(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (role === "admin") {
                return prisma_1.default.appointment.findMany({
                    orderBy: { createdAt: "desc" },
                });
            }
            return prisma_1.default.appointment.findMany({
                where: { userId: userId },
                orderBy: { createdAt: "desc" },
            });
        });
    }
    static updateAppointment(id, userId, role, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.getAppointmentById(id);
            if (role !== "admin" && appointment.userId !== userId) {
                throw new errors_1.ApiError("Unauthorized to update this appointment", 403);
            }
            return prisma_1.default.appointment.update({
                where: { id },
                data,
            });
        });
    }
    static deleteAppointment(id, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.getAppointmentById(id);
            if (role !== "admin" && appointment.userId !== userId) {
                throw new errors_1.ApiError("Unauthorized to delete this appointment", 403);
            }
            return prisma_1.default.appointment.delete({
                where: { id },
            });
        });
    }
}
exports.AppointmentService = AppointmentService;
