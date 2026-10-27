import { updateEscrowStatus, getEscrowById } from "../../_db.js";
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
    return res.status(401).json({ error: "Unauthorized. Please log in to complete this escrow." });
  }

  const { id } = req.query;
  const actor = req.body?.actorAddress || user.userId || user.email;

  try {
    // 2. Fetch Escrow
    const escrow = await getEscrowById(id);
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found with ID: " + id });
    }

    // 3. Verify Authorization: Only buyer or seller can mark complete
    const isParty =
      escrow.buyerAddress === user.userId ||
      escrow.buyerAddress === user.email ||
      escrow.buyerAddress === actor ||
      escrow.sellerAddress === user.userId ||
      escrow.sellerAddress === user.email ||
      escrow.sellerAddress === actor ||
      user.simulated;

    if (!isParty) {
      return res.status(403).json({
        error: "Forbidden. Only authorized parties can mark this escrow as complete.",
      });
    }

    const updated = await updateEscrowStatus(id, "COMPLETED", actor);
    return res.status(200).json(updated);
  } catch (err) {
    console.error("[API complete error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
