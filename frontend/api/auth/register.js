import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmailOrId, createUser } from "../_db.js";

const JWT_SECRET = process.env.JWT_SECRET || "shield-escrow-jwt-secret-key-32chars-min";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, fullName, username } = req.body || {};

    const cleanEmail = (email || "").trim().toLowerCase();

    // Strict Gmail ID Validation: only accept actual @gmail.com or @googlemail.com
    const gmailPattern = /^[a-z0-9](\.?[a-z0-9]){4,}@(gmail|googlemail)\.com$/i;
    if (!cleanEmail || !gmailPattern.test(cleanEmail)) {
      return res.status(400).json({
        error: "Please enter a valid Gmail address (e.g., yourname@gmail.com). Only official Gmail IDs are accepted.",
      });
    }

    // Password validation
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Username validation & formatting
    let cleanUsername = (username || "").trim().toLowerCase();
    if (cleanUsername) {
      if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
        return res.status(400).json({
          error: "Username must be 3–24 characters and only contain letters, numbers, or underscores.",
        });
      }

      // Check if username is already taken
      const existingByUsername = await findUserByEmailOrId(cleanUsername);
      if (existingByUsername) {
        return res.status(409).json({
          error: `Username '@${cleanUsername}' is already taken. Please choose another.`,
        });
      }
    } else {
      // Default username to Gmail prefix
      cleanUsername = cleanEmail.split("@")[0].replace(/[^a-z0-9_]/g, "_").slice(0, 24);
    }

    // Check if email is already registered
    const existing = await findUserByEmailOrId(cleanEmail);
    if (existing) {
      return res.status(409).json({
        error: "An account with this Gmail address already exists. Please log in.",
      });
    }

    // Generate standard IDs
    const baseNumber = Math.floor(100000 + Math.random() * 900000);
    const userId = `USR-${baseNumber}`;
    const buyerId = `BUY-${baseNumber}`;
    const sellerId = `SEL-${baseNumber}`;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with verified Gmail & chosen Username
    const newUser = await createUser({
      userId,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      fullName: fullName?.trim() || cleanUsername,
      buyerId,
      sellerId,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.userId, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return safe user object and token
    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error("[Auth] Register error:", err);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
}