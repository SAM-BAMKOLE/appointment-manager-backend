"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAsync = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(message, statusCode) {
        if (Array.isArray(message)) {
            super("Validation error");
            this.issues = message;
        }
        else {
            super(message);
        }
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
const handleAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.handleAsync = handleAsync;
