import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "shield-escrow-jwt-secret-key-32chars-min";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization || req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({ user: decoded });
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  } catch (err) {
    console.error("[Auth] Me error:", err);
    return res.status(500).json({ error: "Authentication check failed" });
  }
}