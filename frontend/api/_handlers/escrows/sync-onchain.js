import { syncOnChain } from "../../_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  const contractAddress = req.body?.contractAddress || req.query.contractAddress;
  const txHash = req.body?.txHash || req.query.txHash;
  const status = req.body?.status || req.query.status;

  try {
    if (req.method === "POST") {
      const updated = await syncOnChain(id, contractAddress, txHash, status);
      return res.status(200).json(updated);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[API sync-onchain error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
