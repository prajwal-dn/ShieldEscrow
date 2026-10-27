import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "shield-escrow-jwt-secret-key-32chars-min";

/**
 * Verify request authentication token.
 * Supports standard JWT tokens and dev simulation tokens.
 */
export function verifyAuth(req) {
  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (!authHeader || typeof authHeader !== "string") return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return null;

    const token = parts[1];

    // Dev simulation token handling
    if (token.startsWith("sim_")) {
      try {
        const decoded = JSON.parse(Buffer.from(token.substring(4), "base64").toString("utf8"));
        return decoded;
      } catch {
        return null;
      }
    }

    // Standard JWT verification
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Standard secure CORS headers.
 */
export function applyCors(req, res, allowedMethods = "GET,POST,OPTIONS") {
  const origin = req.headers?.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", allowedMethods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Vary", "Origin");
}
