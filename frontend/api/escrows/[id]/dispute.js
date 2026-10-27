import { raiseDispute, getEscrowById } from "../../_db.js";
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
    return res.status(401).json({ error: "Unauthorized. Please log in to raise a dispute." });
  }

  const { id } = req.query;
  const raisedBy = req.body?.raisedBy || user.userId || user.email;
  const reason = req.body?.reason || null;

  try {
    // 2. Fetch Escrow
    const escrow = await getEscrowById(id);
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found with ID: " + id });
    }

    // 3. Verify Authorization: Only buyer or seller can raise dispute
    const isParty =
      escrow.buyerAddress === user.userId ||
      escrow.buyerAddress === user.email ||
      escrow.buyerAddress === raisedBy ||
      escrow.sellerAddress === user.userId ||
      escrow.sellerAddress === user.email ||
      escrow.sellerAddress === raisedBy ||
      user.simulated;

    if (!isParty) {
      return res.status(403).json({
        error: "Forbidden. Only the buyer or seller can raise a dispute for this escrow.",
      });
    }

    const updated = await raiseDispute(id, raisedBy, reason);
    return res.status(200).json(updated);
  } catch (err) {
    console.error("[API dispute error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
