import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/jwt.js";

class UserController {
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const existingUser = await UserModel.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      const userId = await UserModel.create(name, email, password);
      const user = await UserModel.findById(userId);
      const token = generateToken(user);

      res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Registration failed", details: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);

      if (!user || user.status === "blocked") {
        return res
          .status(401)
          .json({ error: "Invalid credentials or account blocked" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      await UserModel.updateLastLogin(user.id);
      const token = generateToken(user);

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed", details: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAllUsers();
      res.json(users);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to retrieve users", details: error.message });
    }
  }

  static async updateUserStatus(req, res) {
    try {
      const { userIds, status } = req.body;
      await UserModel.updateStatus(userIds, status);
      res.json({ message: `Users ${status}d successfully` });
    } catch (error) {
      res.status(500).json({
        error: "Failed to update user status",
        details: error.message,
      });
    }
  }

  static async deleteUsers(req, res) {
    try {
      const { userIds } = req.body;
      await UserModel.deleteUsers(userIds);
      res.json({ message: "Users deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete users", details: error.message });
    }
  }
}

export default UserController;
