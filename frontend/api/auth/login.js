import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmailOrId } from "../_db.js";

const JWT_SECRET = process.env.JWT_SECRET || "shield-escrow-jwt-secret-key-32chars-min";

export async function POST(req) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return new Response(JSON.stringify({ error: "Email/User ID and password are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find user by email or userId
    const cleanId = identifier.trim().toLowerCase();
    const user = await findUserByEmailOrId(cleanId);

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid User ID/Email or password." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid User ID/Email or password." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user object (without password) and token
    const { passwordHash: _, ...safeUser } = user;
    return new Response(JSON.stringify({ user: safeUser, token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    return new Response(JSON.stringify({ error: "Login failed. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}