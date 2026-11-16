import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";

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

        // Handle unexpected server errors
        server.on("error", (error) => {
            console.error("Server error:", error.message);
            process.exit(1);
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("SIGTERM received. Closing server...");

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