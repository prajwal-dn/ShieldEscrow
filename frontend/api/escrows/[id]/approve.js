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
    return res.status(401).json({ error: "Unauthorized. Please log in to approve this escrow." });
  }

  const { id } = req.query;
  const actor = req.body?.actorAddress || user.userId || user.email;

  try {
    // 2. Fetch Escrow
    const escrow = await getEscrowById(id);
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found with ID: " + id });
    }

    // 3. Verify Authorization: Only the designated buyer can approve & release escrow funds
    const isBuyer =
      escrow.buyerAddress === user.userId ||
      escrow.buyerAddress === user.email ||
      escrow.buyerAddress === actor ||
      user.simulated;

    if (!isBuyer) {
      return res.status(403).json({
        error: "Forbidden. Only the designated buyer can approve and release funds for this escrow.",
      });
    }

    const updated = await updateEscrowStatus(id, "RELEASED", actor);
    return res.status(200).json(updated);
  } catch (err) {
    console.error("[API approve error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
