import { resolveDispute, getEscrowById } from "../../_db.js";
import { verifyAuth, applyCors } from "../../_auth.js";

export default async function handler(req, res) {
  applyCors(req, res, "POST,OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Verify Authentication
  const user = verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Please log in to resolve a dispute." });
  }

  const { id } = req.query;
  const resolver = req.body?.resolverAddress || user.userId || user.email;
  const resolution = req.body?.resolution || "RELEASED";
  const note = req.body?.note || null;

  try {
    // 2. Fetch Escrow
    const escrow = await getEscrowById(id);
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found with ID: " + id });
    }

    if (escrow.status !== "DISPUTED") {
      return res.status(400).json({ error: "Escrow is not in DISPUTED state." });
    }

    const updated = await resolveDispute(id, resolution, resolver, note);
    return res.status(200).json(updated);
  } catch (err) {
    console.error("[API resolve-dispute error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
