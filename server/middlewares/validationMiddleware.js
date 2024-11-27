import { registerSchema, loginSchema } from "../utils/validationSchemas.js";
import { AppError } from "../utils/errorHandler.js";

const validateRegistration = (req, res, next) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });

  if (error) {
    error.isJoi = true;
    return next(error);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    error.isJoi = true;
    return next(error);
  }

  next();
};

export { validateRegistration, validateLogin };
