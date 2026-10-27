import { getEscrowById, findUserByEmailOrId } from "../../_db.js";
import { verifyAuth, applyCors } from "../../_auth.js";

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;

  try {
    const auth = verifyAuth(req);
    if (!auth) {
      return res.status(401).json({ error: "Authentication required to view escrow details." });
    }

    const user = await findUserByEmailOrId(auth.userId || auth.email);
    const userKeys = [
      auth.userId,
      auth.email,
      user?.buyerId,
      user?.sellerId,
      user?.userId,
      user?.email,
    ].filter(Boolean).map(s => String(s).toLowerCase());

    if (req.method === "GET") {
      const escrow = await getEscrowById(id);
      if (!escrow) {
        return res.status(404).json({ error: "Escrow contract not found with ID: " + id });
      }

      const buyer = (escrow.buyerAddress || "").toLowerCase();
      const seller = (escrow.sellerAddress || "").toLowerCase();

      // Strict Counterparty Authorization: Prevent unauthorized users from seeing others' contracts
      if (!userKeys.includes(buyer) && !userKeys.includes(seller)) {
        return res.status(403).json({
          error: "Forbidden: You are not an authorized counterparty to this escrow contract."
        });
      }

      return res.status(200).json(escrow);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[API /api/escrows/[id] error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
