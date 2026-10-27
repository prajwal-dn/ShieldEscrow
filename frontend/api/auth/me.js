import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "shield-escrow-jwt-secret-key-32chars-min";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return new Response(JSON.stringify({ user: decoded }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("[Auth] Me error:", err);
    return new Response(JSON.stringify({ error: "Authentication check failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}