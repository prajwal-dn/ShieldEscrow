import { useState } from "react";
import api from "../services/api";
import {
  HiShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineLink,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineRefresh
} from "react-icons/hi";

export default function AIVerificationPanel({
  escrow,
  isSeller,
  isBuyer,
  onVerificationComplete,
}) {
  const [deliverableLink, setDeliverableLink] = useState(escrow.deliverableLink || "");
  const [sellerNote, setSellerNote] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [aiResult, setAiResult] = useState(escrow.aiVerificationResult || null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliverableLink.trim()) {
      setError("Please provide a valid deliverable URL or repository link.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const response = await api.post(`/api/escrows/${escrow.id}/verify-delivery`, {
        deliverableLink: deliverableLink.trim(),
        sellerNote: sellerNote.trim(),
        sellerId: escrow.sellerAddress,
      });

      const data = response.data;
      setAiResult(data.aiResult);

      if (onVerificationComplete) {
        onVerificationComplete(data);
      }
    } catch (err) {
      console.error("AI verification failed:", err);
      setError(err.response?.data?.error || err.message || "Failed to trigger AI verification");
    } finally {
      setVerifying(false);
    }
  };

  const isApproved = aiResult?.passed || escrow.status === "AI_APPROVED" || escrow.status === "COMPLETED";

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-200/80 dark:border-cyan-500/20 space-y-6 shadow-xl relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <HiOutlineSparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                AI Escrow Arbitrator & Verification Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-cyan-500/10 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-cyan-500/20">
                Gemini 3.5
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated smart contract inspection: checks if deliverables satisfy all treaty rules before releasing funds.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        {isApproved ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            GREEN SIGNAL: FUNDS RELEASED
          </span>
        ) : aiResult ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
            <HiOutlineClock className="w-3.5 h-3.5" />
            REVISIONS NEEDED ({aiResult.score || 0}/100)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
            Awaiting Submission
          </span>
        )}
      </div>

      {/* Agreed Contract Criteria Review Box */}
      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <HiOutlineDocumentText className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
            Agreed Treaty Criteria (Evaluation Rubric)
          </span>
          <span>Window: {escrow.inspectionWindow || "72 Hours"}</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-mono bg-white dark:bg-black/20 p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
          {escrow.inspectionCriteria || "Standard deliverable matching agreement specifications."}
        </p>
      </div>

      {/* Green Signal Approval Banner if Passed */}
      {isApproved && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-cyan-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5 shadow-md shadow-emerald-500/25">
              <HiOutlineCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display text-emerald-800 dark:text-emerald-300">
                  Green Signal Granted — Escrow Settled
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  Score: {aiResult?.score || 100}/100
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-1 leading-relaxed">
                {aiResult?.summary || "All contract acceptance criteria have been verified. The smart contract has authorized the release of locked capital to the seller."}
              </p>
            </div>
          </div>

          {escrow.deliverableLink && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs font-mono flex items-center justify-between">
              <span className="text-emerald-700 dark:text-emerald-400">Verified Deliverable:</span>
              <a
                href={escrow.deliverableLink}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 dark:text-emerald-300 underline font-bold truncate max-w-xs"
              >
                {escrow.deliverableLink}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Seller Deliverable Submission Form */}
      {(!isApproved || isSeller) && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <HiOutlineLink className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
                Seller Deliverable Link (Product, Commit SHA, or Artifact URL)
              </span>
              <span className="text-[11px] font-mono text-slate-400">Publicly Accessible URL</span>
            </label>
            <input
              type="url"
              value={deliverableLink}
              onChange={(e) => setDeliverableLink(e.target.value)}
              placeholder="https://github.com/org/repo or https://app.example.com"
              disabled={verifying}
              className="glass-input w-full px-4 py-3 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Seller Delivery Note (Walkthrough of how rules were met)
            </label>
            <textarea
              rows={2}
              value={sellerNote}
              onChange={(e) => setSellerNote(e.target.value)}
              placeholder="Explain how the deliverable satisfies the inspection criteria..."
              disabled={verifying}
              className="glass-input w-full p-3 rounded-xl text-xs"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <HiOutlineXCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={verifying}
              className="btn-shimmer-primary w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              {verifying ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Gemini Model Inspecting Treaty Rules...</span>
                </>
              ) : (
                <>
                  <HiShieldCheck className="w-4 h-4" />
                  <span>{aiResult ? "Re-Run AI Verification" : "Submit Deliverable & Verify with AI"}</span>
                </>
              )}
            </button>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              ⚡ Instant zero-fee AI criteria evaluation via Gemini 3.5 Flash
            </span>
          </div>
        </form>
      )}

      {/* Detailed AI Verification Rubric & Criteria Breakdown */}
      {aiResult?.criteriaChecks && aiResult.criteriaChecks.length > 0 && (
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>AI Criteria Evaluation Breakdown</span>
            <span className="text-indigo-600 dark:text-cyan-400 font-bold">
              Verdict: {aiResult.verdict || (aiResult.passed ? "APPROVED" : "REVISE")}
            </span>
          </h4>

          <div className="space-y-2">
            {aiResult.criteriaChecks.map((check, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs border flex items-start gap-3 ${
                  check.met
                    ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
                    : "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20"
                }`}
              >
                <div className="mt-0.5">
                  {check.met ? (
                    <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <HiOutlineXCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {check.criterion}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 block">
                    {check.comment}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {aiResult.feedback && (
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-xs font-mono text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Arbitrator Feedback:</span>
              {aiResult.feedback}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
