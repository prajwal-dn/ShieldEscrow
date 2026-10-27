import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmailOrId } from "../../_db.js";

const JWT_SECRET = process.env.JWT_SECRET || "shield-escrow-jwt-secret-key-32chars-min";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/User ID and password are required." });
    }

    // Find user by email, username, or userId
    const cleanId = identifier.trim().toLowerCase();
    const user = await findUserByEmailOrId(cleanId);

    if (!user) {
      return res.status(401).json({ error: "Invalid User ID/Email or password." });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid User ID/Email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user object (without password) and token
    const { passwordHash: _, ...safeUser } = user;
    return res.status(200).json({ user: safeUser, token });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
}