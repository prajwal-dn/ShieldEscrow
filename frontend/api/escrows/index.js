import { getAllEscrows, createEscrow } from "../_db.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const escrows = await getAllEscrows();
      return res.status(200).json(escrows);
    }

    if (req.method === "POST") {
      const created = await createEscrow(req.body);
      return res.status(200).json(created);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[API /api/escrows error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
