import { getEvents } from "../../_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const events = await getEvents(id);
      return res.status(200).json(events);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[API events error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
