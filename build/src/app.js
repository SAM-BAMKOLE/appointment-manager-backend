"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const logger_1 = __importDefault(require("./config/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",")) || [
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("combined", { stream: { write: (message) => logger_1.default.info(message.trim()) } }));
// Routes
app.get("/api/health", (req, res) => res.send({ message: "Hello world!" }));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/appointments", appointmentRoutes_1.default);
// Error Handler
app.use(errorHandler_1.errorHandler);
app.listen(env_1.config.port, () => {
    logger_1.default.info(`Server running on port ${env_1.config.port}`);
});
exports.default = app;
