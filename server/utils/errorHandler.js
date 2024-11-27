class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors; 
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleValidationError = (err, res) => {
  res.status(400).json({
    status: "fail",
    message: "Validation failed",
    errors: err.errors.map((error) => ({
      field: error.field,
      message: error.message,
    })),
  });
};

const handleDuplicateKeyError = (err, res) => {
  const duplicateKey = Object.keys(err.keyPattern)[0];
  res.status(409).json({
    status: "fail",
    message: `${duplicateKey} already exists`,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error("Global Error:", err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.isJoi) {
    const validationErrors = err.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message,
    }));

    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  if (err instanceof AppError && err.errors && err.errors.length > 0) {
    return handleValidationError(err, res);
  }

  if (err.code === 11000) {
    return handleDuplicateKeyError(err, res);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
export { AppError, globalErrorHandler };
