import { getAllEscrows, createEscrow, findUserByEmailOrId } from "../_db.js";
import { verifyAuth, applyCors } from "../_auth.js";

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const auth = verifyAuth(req);
    if (!auth) {
      return res.status(401).json({ error: "Authentication required to access escrow accounts." });
    }

    // Resolve current user profile from DB or token
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
      const allEscrows = await getAllEscrows();
      
      // Strict Account Isolation: Only return escrows belonging to the authenticated user
      const userEscrows = allEscrows.filter(e => {
        const buyer = (e.buyerAddress || "").toLowerCase();
        const seller = (e.sellerAddress || "").toLowerCase();
        return userKeys.includes(buyer) || userKeys.includes(seller);
      });

      return res.status(200).json(userEscrows);
    }

    if (req.method === "POST") {
      // Generate a unique invite token so buyer can share link with seller
      const inviteToken = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Bind escrow creation to the authenticated user's verified identity
      const payload = {
        ...req.body,
        buyerAddress: user?.buyerId || req.body.buyerAddress || auth.userId,
        inviteToken,
      };
      const created = await createEscrow(payload);
      return res.status(200).json(created);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[API /api/escrows error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
