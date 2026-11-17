export default function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.statusCode || 500;
  let message = error.message || "Internal server error";
  if (error.name === "ValidationError") {
    status = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  } else if (error.code === 11000) {
    status = 409;
    message = `A record with this ${Object.keys(error.keyValue || {}).join(", ")} already exists.`;
  } else if (error.name === "CastError") {
    status = 400;
    message = "Invalid resource identifier.";
  }
  if (process.env.NODE_ENV !== "production") console.error(error);
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
  });
}
