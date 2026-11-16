import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = [
    "MONGODB_URI",
];

requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT) || 5000,

    MONGODB_URI: process.env.MONGODB_URI,

    CLIENT_URL: process.env.CLIENT_URL,

    ALLOWED_ORIGINS: (
        process.env.ALLOWED_ORIGINS || ""
    )
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
};