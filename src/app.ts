import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config/env";
import logger from "./config/logger";
import { errorHandler } from "./middleware/errorHandler";
import appointmentRoutes from "./routes/appointmentRoutes";
import authRoutes from "./routes/authRoutes";

const app: Express = express();

// Middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://schedify-backend.onrender.com",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

// Routes
app.get("/api/health", (req, res) => res.send({ message: "Hello world!" }));
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

// Error Handler
app.use(errorHandler);

app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
});

export default app;
