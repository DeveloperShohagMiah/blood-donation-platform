import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";
import { runLifecycleJobs } from "./services/request-lifecycle.service.js";

const LIFECYCLE_INTERVAL_MS = 60 * 60 * 1000;

const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Start Express server
        const server = app.listen(env.PORT, () => {
            console.log(
                `Blood Connect server running on port ${env.PORT}`
            );
        });

        // Keep request statuses and notifications fresh without manual work.
        const startupJob = setTimeout(() => {
            void runLifecycleJobs().catch((error) =>
                console.error("Lifecycle job failed:", error.message)
            );
        }, 5_000);
        const lifecycleTimer = setInterval(() => {
            void runLifecycleJobs().catch((error) =>
                console.error("Lifecycle job failed:", error.message)
            );
        }, LIFECYCLE_INTERVAL_MS);
        lifecycleTimer.unref?.();

        // Handle unexpected server errors
        server.on("error", (error) => {
            console.error("Server error:", error.message);
            process.exit(1);
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("SIGTERM received. Closing server...");

            clearTimeout(startupJob);
            clearInterval(lifecycleTimer);
            server.close(() => {
                console.log("Server closed.");
                process.exit(0);
            });
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();