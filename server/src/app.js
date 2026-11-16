import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middlewares/error.middleware.js";
import { env } from "./config/env.js";

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin(origin, callback) {
            // Allow requests without an Origin header,
            // such as server-to-server requests.
            if (!origin) {
                return callback(null, true);
            }

            if (env.ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },
        credentials: true,
    })
);

// Request logging
if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Health check
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Blood Connect API is running",
        environment: env.NODE_ENV,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

// Global error handler
app.use(errorHandler);

export default app;