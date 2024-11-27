import express from "express";
import UserController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateRegistration,
  validateLogin,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/register", validateRegistration, UserController.register);
router.post("/login", validateLogin, UserController.login);

router.get("/users", authMiddleware, UserController.getAllUsers);
router.put("/users/status", authMiddleware, UserController.updateUserStatus);
router.delete("/users", authMiddleware, UserController.deleteUsers);

export default router;
