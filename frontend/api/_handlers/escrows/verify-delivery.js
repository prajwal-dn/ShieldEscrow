// AI-powered delivery verification endpoint using Gemini 3.5 Flash
// POST /api/escrows/:id/verify-delivery
// Calls Google Gemini to check if seller's deliverable link satisfies all contract criteria

import { getEscrowById, updateEscrowField, logEvent } from "../../_db.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const escrow = await getEscrowById(id);
  if (!escrow) {
    return res.status(404).json({ error: "Escrow not found" });
  }

  const { deliverableLink, sellerNote } = req.body;

  if (!deliverableLink || !deliverableLink.trim()) {
    return res.status(400).json({ error: "deliverableLink is required" });
  }

  // System prompt enforcing strict structured JSON response
  const prompt = `You are a neutral, rigorous escrow arbitration AI for the ShieldEscrow platform.
Your job is to evaluate whether a seller's submitted deliverable link satisfies ALL contract criteria agreed upon by buyer and seller.

CONTRACT SPECIFICATIONS:
Description: ${escrow.description}
Inspection Criteria / Rules:
${escrow.inspectionCriteria || "Standard deliverable matching description."}

Mandatory Proof of Delivery:
${escrow.proofOfDelivery || "Verifiable public link or repository."}

SELLER'S SUBMISSION:
Deliverable Link: ${deliverableLink.trim()}
Seller Note: ${sellerNote || "None provided"}

TASK:
Analyze whether this deliverable link and submission reasonably satisfies the criteria and requirements.
Evaluate each criterion individually.
Determine if the green signal (approval) should be given to release the escrow funds to the seller.

Respond ONLY with a valid JSON object matching this structure (no markdown formatting, no code fences):
{
  "passed": true,
  "score": 95,
  "verdict": "APPROVED or REJECTED",
  "summary": "1-2 sentence executive verdict",
  "criteriaChecks": [
    {
      "criterion": "Requirement description",
      "met": true,
      "comment": "Why this requirement is or isn't satisfied"
    }
  ],
  "feedback": "Constructive feedback for both parties"
}`;

  let aiResult = null;
  let aiError = null;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Clean JSON content
    const cleaned = rawContent.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    aiResult = JSON.parse(cleaned);
  } catch (err) {
    console.warn("[Gemini Verify] Evaluation error:", err.message);
    aiError = err.message;
    aiResult = {
      passed: false,
      score: 50,
      verdict: "MANUAL_REVIEW_REQUIRED",
      summary: "Automated verification encountered a parsing issue. Manual review required.",
      criteriaChecks: [],
      feedback: `AI verification note: ${err.message}`,
    };
  }

  const passed = Boolean(aiResult?.passed);
  const newStatus = passed ? "AI_APPROVED" : "DELIVERY_FLAGGED";

  // Persist delivery link & AI verdict
  await updateEscrowField(Number(id), {
    deliverableLink: deliverableLink.trim(),
    aiVerificationResult: JSON.stringify(aiResult),
    status: newStatus,
  });

  const actorId = req.body.sellerId || escrow.sellerAddress || "seller";
  await logEvent(
    Number(id),
    passed ? "AI_APPROVED" : "AI_REJECTED",
    actorId,
    null,
    passed
      ? `AI Verification Passed (${aiResult.score}/100). Green signal granted: escrow release authorized.`
      : `AI Verification Failed (${aiResult.score}/100): ${aiResult.summary}`
  );

  return res.status(200).json({
    escrowId: Number(id),
    deliverableLink,
    aiResult,
    aiError,
    status: newStatus,
    released: passed,
  });
}
