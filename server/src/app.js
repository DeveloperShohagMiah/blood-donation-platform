import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";
import { env } from "./config/env.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      const error = new Error("Not allowed by CORS");
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
if (env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());

app.get("/", (req, res) =>
  res.json({ success: true, message: "Blood Connect API", version: "1.0.0" }),
);
app.get("/api/v1/health", (req, res) =>
  res.json({ success: true, message: "Blood Connect API is running", environment: env.NODE_ENV }),
);
app.use("/api/v1", apiRoutes);
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` }),
);
app.use(errorHandler);

export default app;
