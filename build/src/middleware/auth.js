"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const errors_1 = require("../utils/errors");
const auth_1 = require("../utils/auth");
// export const verifyToken = (token: string) => {
//     return jwt.verify(token, config.jwtSecret) as { id: string; role: string; email: string };
// };
const authenticate = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            throw new errors_1.ApiError("Access token required", 401);
        }
        const decoded = (0, auth_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(new errors_1.ApiError("Invalid token", 401));
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.ApiError("Authentication required", 403));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errors_1.ApiError("Insufficient permissions", 403));
        }
        next();
    };
};
exports.authorize = authorize;
