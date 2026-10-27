import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmailOrId, createUser } from "../_db.js";

const JWT_SECRET = process.env.JWT_SECRET || "shield-escrow-jwt-secret-key-32chars-min";

export async function POST(req) {
  try {
    const { email, password, fullName, username } = await req.json();

    const cleanEmail = (email || "").trim().toLowerCase();

    // Strict Gmail ID Validation: only accept actual @gmail.com or @googlemail.com
    const gmailPattern = /^[a-z0-9](\.?[a-z0-9]){4,}@(gmail|googlemail)\.com$/i;
    if (!cleanEmail || !gmailPattern.test(cleanEmail)) {
      return new Response(
        JSON.stringify({
          error: "Please enter a valid Gmail address (e.g., yourname@gmail.com). Only official Gmail IDs are accepted.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Password validation
    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Username validation & formatting
    let cleanUsername = (username || "").trim().toLowerCase();
    if (cleanUsername) {
      if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
        return new Response(
          JSON.stringify({
            error: "Username must be 3–24 characters and only contain letters, numbers, or underscores.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Check if username is already taken
      const existingByUsername = await findUserByEmailOrId(cleanUsername);
      if (existingByUsername) {
        return new Response(
          JSON.stringify({ error: `Username '@${cleanUsername}' is already taken. Please choose another.` }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      // Default username to Gmail prefix
      cleanUsername = cleanEmail.split("@")[0].replace(/[^a-z0-9_]/g, "_").slice(0, 24);
    }

    // Check if email is already registered
    const existing = await findUserByEmailOrId(cleanEmail);
    if (existing) {
      return new Response(
        JSON.stringify({ error: "An account with this Gmail address already exists. Please log in." }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
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
    return new Response(JSON.stringify({ user: safeUser, token }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Auth] Register error:", err);
    return new Response(JSON.stringify({ error: "Registration failed. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}