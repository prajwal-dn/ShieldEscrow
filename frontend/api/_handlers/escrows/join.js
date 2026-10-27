// GET /api/escrows/join?token=INV-...
// Called when seller clicks the invite link. Returns escrow contract details.
// POST /api/escrows/join — seller registers themselves as the seller on the contract.

import { getEscrowByInviteToken, updateEscrowField, logEvent, findUserByEmailOrId } from "../../_db.js";
import { verifyAuth, applyCors } from "../../_auth.js";

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Invite token is required" });
  }

  // GET — preview the contract before joining (no auth required for preview)
  if (req.method === "GET") {
    const escrow = await getEscrowByInviteToken(token);
    if (!escrow) {
      return res.status(404).json({ error: "Invalid or expired invite token" });
    }
    // Return safe public view of the contract (no private keys)
    return res.status(200).json({
      id: escrow.id,
      description: escrow.description,
      amount: escrow.amount,
      inspectionCriteria: escrow.inspectionCriteria,
      inspectionWindow: escrow.inspectionWindow,
      proofOfDelivery: escrow.proofOfDelivery,
      status: escrow.status,
      buyerAddress: escrow.buyerAddress,
      sellerJoined: escrow.sellerJoined,
      createdAt: escrow.createdAt,
    });
  }

  // POST — seller accepts the invite and joins the contract
  if (req.method === "POST") {
    const auth = verifyAuth(req);
    if (!auth) {
      return res.status(401).json({ error: "Authentication required to join a contract" });
    }

    const escrow = await getEscrowByInviteToken(token);
    if (!escrow) {
      return res.status(404).json({ error: "Invalid or expired invite token" });
    }

    if (escrow.sellerJoined) {
      return res.status(409).json({ error: "A seller has already joined this contract" });
    }

    // Get the joining user's sellerId
    const user = await findUserByEmailOrId(auth.userId || auth.email);
    const sellerAddress = user?.sellerId || auth.userId;

    // Bind seller to the contract
    await updateEscrowField(escrow.id, {
      sellerAddress,
      sellerJoined: true,
      status: "AWAITING_FUNDING",
    });

    await logEvent(
      escrow.id,
      "SELLER_JOINED",
      sellerAddress,
      null,
      `Seller ${sellerAddress} accepted the contract invite and joined the session.`
    );

    return res.status(200).json({
      success: true,
      escrowId: escrow.id,
      sellerAddress,
      message: "You have successfully joined the contract. The buyer will now deposit funds.",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
