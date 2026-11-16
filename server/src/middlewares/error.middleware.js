import { env } from "../config/env.js";

const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (error.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Origin not allowed",
        });
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message:
            env.NODE_ENV === "development"
                ? error.message
                : "Internal server error",
    });
};

export default errorHandler;