import db from "../config/database.js";
import bcrypt from "bcryptjs";

class UserModel {
  static async create(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  static async updateLastLogin(userId) {
    await db.execute(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [userId]
    );
  }

  static async updateStatus(userIds, status) {
    const placeholders = userIds.map(() => "?").join(",");
    await db.execute(
      `UPDATE users SET status = ? WHERE id IN (${placeholders})`,
      [status, ...userIds]
    );
  }

  static async deleteUsers(userIds) {
    const placeholders = userIds.map(() => "?").join(",");
    await db.execute(
      `DELETE FROM users WHERE id IN (${placeholders})`,
      userIds
    );
  }

  static async getAllUsers() {
    const [rows] = await db.execute(`
      SELECT id, name, email, status, last_login, registration_time 
      FROM users 
      ORDER BY 
        CASE WHEN last_login IS NULL THEN 1 ELSE 0 END, 
        last_login DESC
    `);
    return rows;
  }
}

export default UserModel;
