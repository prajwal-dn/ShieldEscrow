import { raiseDispute } from "../../_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  const raisedBy = req.body?.raisedBy || "unknown";
  const reason = req.body?.reason || null;

  try {
    if (req.method === "POST") {
      const updated = await raiseDispute(id, raisedBy, reason);
      return res.status(200).json(updated);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[API dispute error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
