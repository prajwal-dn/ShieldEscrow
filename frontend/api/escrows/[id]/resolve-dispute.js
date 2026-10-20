import { resolveDispute } from "../../_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  const resolver = req.body?.resolverAddress || "arbitrator";
  const resolution = req.body?.resolution || "RELEASED";
  const note = req.body?.note || null;

  try {
    if (req.method === "POST") {
      const updated = await resolveDispute(id, resolution, resolver, note);
      return res.status(200).json(updated);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[API resolve-dispute error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
