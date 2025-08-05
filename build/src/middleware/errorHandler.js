"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../config/logger"));
const errorHandler = (err, req, res, next) => {
    let error = Object.assign({}, err);
    error.message = err.message;
    // Log error
    logger_1.default.error(err);
    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = "Resource not found";
        error = new errors_1.ApiError(message, 404);
    }
    // Mongoose duplicate key
    if (err.name === "MongoError" && err.code === 11000) {
        const message = "Duplicate field value entered";
        error = new errors_1.ApiError(message, 400);
    }
    // Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new errors_1.ApiError(message.join(", "), 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.issues ? error.issues : error.message || "Server Error",
    });
};
exports.errorHandler = errorHandler;
