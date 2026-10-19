import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import ActivityTimeline from "../components/ActivityTimeline";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import TransactionStatus from "../components/TransactionStatus";
import { useWallet } from "../context/WalletContext";
import useEscrowNotifications from "../hooks/useEscrowNotifications";
import api from "../services/api";
import { signTransaction, submitTransaction } from "../services/escrowService";

const ACTIVE_STATUSES = ["CREATED", "FUNDED", "COMPLETED"];

function EscrowDetails() {
  const { id } = useParams();
  const { connected, address, walletApi, initiateConnect } = useWallet();

  const [escrow, setEscrow] = useState(null);
  const [transactionState, setTransactionState] = useState("idle");
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dispute state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeError, setDisputeError] = useState("");

  // Dispute Resolution state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveTarget, setResolveTarget] = useState("RELEASED");
  const [resolveNote, setResolveNote] = useState("");
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveError, setResolveError] = useState("");

  // Per-escrow WebSocket subscription — live updates when status changes
  const { lastNotification } = useEscrowNotifications(id);

  const fetchEscrow = useCallback(async () => {
    try {
      const response = await api.get(`/api/escrows/${id}`);
      setEscrow(response.data);
      if (response.data.txHash) {
        setTransactionHash(response.data.txHash);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load escrow.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchEscrow();
  }, [fetchEscrow]);

  // Re-fetch escrow data whenever a WebSocket notification arrives
  useEffect(() => {
    if (!lastNotification) return;
    fetchEscrow();
  }, [lastNotification, fetchEscrow]);

  // ── Complete Work (seller marks work done) ─────────────────────────────────
  const handleCompleteWork = async () => {
    if (!connected) {
      initiateConnect();
      return;
    }
    try {
      const response = await api.post(`/api/escrows/${id}/complete`, {
        actorAddress: address || "seller",
      });
      setEscrow(response.data);
    } catch (err) {
      console.error("Failed to mark work completed:", err);
    }
  };

  // ── Release Funds ──────────────────────────────────────────────────────────
  const handleReleaseFunds = async () => {
    if (!connected) {
      initiateConnect();
      return;
    }
    try {
      setTransactionState("waiting-signature");
      await signTransaction({ escrowId: id, action: "RELEASE", amount: escrow.amount }, walletApi);
      setTransactionState("submitting");
      const txResult = await submitTransaction(id, "release");
      const generatedTxHash = txResult.txHash;
      await api.post(`/api/escrows/${id}/approve`, {
        actorAddress: address || "buyer",
      });
      const syncResponse = await api.post(`/api/escrows/${id}/sync-onchain`, null, {
        params: { txHash: generatedTxHash, status: "RELEASED" },
      });
      setTransactionHash(generatedTxHash);
      setEscrow(syncResponse.data || {
        ...escrow, status: "RELEASED", txHash: generatedTxHash, onChainSynced: true,
      });
      setTransactionState("success");
    } catch (err) {
      console.error(err);
      setTransactionState("error");
    }
  };

  // ── Raise Dispute ──────────────────────────────────────────────────────────
  const handleRaiseDispute = async () => {
    if (!connected) { initiateConnect(); return; }
    setDisputeLoading(true);
    setDisputeError("");
    try {
      const response = await api.post(`/api/escrows/${id}/dispute`, {
        raisedBy: address || "unknown",
        reason: disputeReason || "Dispute raised by buyer.",
      });
      setEscrow(response.data);
      setShowDisputeModal(false);
      setDisputeReason("");
    } catch (err) {
      console.error(err);
      setDisputeError(
        err.response?.data?.message || "Failed to raise dispute. Please try again."
      );
    } finally {
      setDisputeLoading(false);
    }
  };

  // ── Resolve Dispute ────────────────────────────────────────────────────────
  const handleResolveDispute = async () => {
    if (!connected) { initiateConnect(); return; }
    setResolveLoading(true);
    setResolveError("");
    try {
      const response = await api.post(`/api/escrows/${id}/resolve-dispute`, {
        resolverAddress: address || "arbitrator",
        resolution: resolveTarget,
        note: resolveNote || (resolveTarget === "RELEASED" ? "Funds released to seller following resolution" : "Funds refunded to buyer following resolution"),
      });
      setEscrow(response.data);
      setShowResolveModal(false);
      setResolveNote("");
    } catch (err) {
      console.error(err);
      setResolveError(
        err.response?.data?.message || "Failed to resolve dispute. Please check permissions."
      );
    } finally {
      setResolveLoading(false);
    }
  };

  // ── Render States ──────────────────────────────────────────────────────────
  if (loading) return <Loader message="Loading Escrow..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  const canRelease = escrow.status !== "RELEASED" && escrow.status !== "REFUNDED" && escrow.status !== "DISPUTED";
  const canComplete = escrow.status === "CREATED" || escrow.status === "FUNDED";

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-sky-400">Escrow Details</h1>
        <p className="text-slate-400 mt-2">View and manage this escrow contract securely.</p>
      </div>

      {/* Main Card */}
      <div className="max-w-3xl bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <h2 className="text-3xl font-bold mb-8">{escrow.description}</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-slate-400 text-sm mb-1">Buyer Wallet</p>
            <p className="break-all">{escrow.buyerAddress}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Seller Wallet</p>
            <p className="break-all">{escrow.sellerAddress}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Amount</p>
            <p className="text-2xl font-bold text-green-400">{escrow.amount}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Status</p>
            <StatusBadge status={escrow.status} />
          </div>
          <div className="md:col-span-2">
            <p className="text-slate-400 text-sm mb-1">Created At</p>
            <p>{escrow.createdAt}</p>
          </div>
        </div>

        <hr className="border-slate-700 my-8" />

        {/* Wallet warning */}
        {!connected && (
          <div className="mb-5 rounded-xl border border-yellow-500 bg-yellow-500/10 p-4 text-yellow-300">
            🔒 Connect your Midnight wallet to interact with this escrow.
          </div>
        )}

        {/* ── Action Buttons ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Complete Work — seller marks work done */}
          {canComplete && (
            <button
              id="btn-complete-work"
              onClick={handleCompleteWork}
              className="flex-1 py-4 rounded-xl font-semibold text-lg transition bg-purple-500 hover:bg-purple-600"
            >
              {!connected ? "Connect Wallet to Complete" : "✅ Mark Work Completed"}
            </button>
          )}

          {/* Release Funds */}
          {canRelease && (
            <button
              id="btn-release-funds"
              onClick={handleReleaseFunds}
              disabled={
                transactionState === "waiting-signature" ||
                transactionState === "submitting"
              }
              className={`flex-1 py-4 rounded-xl font-semibold text-lg transition ${
                connected
                  ? "bg-sky-500 hover:bg-sky-600"
                  : "bg-slate-600 hover:bg-sky-700"
              }`}
            >
              {!connected
                ? "Connect Wallet to Release"
                : transactionState === "waiting-signature"
                ? "Waiting for Signature…"
                : transactionState === "submitting"
                ? "Submitting Transaction…"
                : "Release Funds"}
            </button>
          )}

          {escrow.status === "RELEASED" && (
            <div
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(52,211,153,0.12)",
                border: "1px solid rgba(52,211,153,0.4)",
                color: "#34d399",
                textAlign: "center",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              ✅ Funds Released
            </div>
          )}

          {escrow.status === "REFUNDED" && (
            <div
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.4)",
                color: "#fb923c",
                textAlign: "center",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              🔄 Funds Refunded to Buyer
            </div>
          )}

          {/* Raise Dispute — only visible when escrow is active */}
          {ACTIVE_STATUSES.includes(escrow.status) && (
            <button
              id="btn-raise-dispute"
              onClick={() => {
                if (!connected) { initiateConnect(); return; }
                setShowDisputeModal(true);
              }}
              style={{
                padding: "16px 24px",
                borderRadius: "12px",
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.5)",
                color: "#f87171",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              ⚠️ Raise Dispute
            </button>
          )}

          {/* Disputed State + Resolve Button */}
          {escrow.status === "DISPUTED" && (
            <div style={{ display: "flex", gap: "12px", width: "100%", flexWrap: "wrap" }}>
              <div
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.4)",
                  color: "#f87171",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                ⚠️ Dispute In Progress
              </div>
              <button
                id="btn-open-resolve-dispute"
                onClick={() => {
                  if (!connected) { initiateConnect(); return; }
                  setShowResolveModal(true);
                }}
                style={{
                  padding: "16px 28px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #0284c7, #0369a1)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 15px rgba(2,132,199,0.3)",
                }}
              >
                ⚖️ Resolve Dispute
              </button>
            </div>
          )}
        </div>

        {/* Transaction Status */}
        <div className="mt-8">
          <TransactionStatus state={transactionState} hash={transactionHash} />
        </div>

        {/* ── Activity Timeline ───────────────────────────────────────────── */}
        <hr className="border-slate-700 my-8" />
        <ActivityTimeline escrowId={id} />
      </div>

      {/* ── Dispute Modal ─────────────────────────────────────────────────── */}
      {showDisputeModal && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowDisputeModal(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, #1e293b, #0f172a)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: "20px",
              padding: "32px",
              width: "min(460px, 92vw)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: "#f87171", fontWeight: 700, fontSize: "1.5rem", marginBottom: "8px" }}>
              ⚠️ Raise a Dispute
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "20px" }}>
              Describe the issue. A dispute will freeze this escrow until it is resolved.
            </p>

            <textarea
              id="dispute-reason-input"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="e.g. The seller did not deliver the agreed-upon work…"
              rows={4}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "#f1f5f9",
                fontSize: "0.9rem",
                resize: "vertical",
                outline: "none",
                marginBottom: "16px",
              }}
            />

            {disputeError && (
              <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "12px" }}>
                {disputeError}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                id="btn-confirm-dispute"
                onClick={handleRaiseDispute}
                disabled={disputeLoading}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  background: disputeLoading
                    ? "rgba(248,113,113,0.3)"
                    : "linear-gradient(135deg, #ef4444, #b91c1c)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: disputeLoading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  transition: "opacity 0.2s",
                }}
              >
                {disputeLoading ? "Submitting…" : "Confirm Dispute"}
              </button>
              <button
                id="btn-cancel-dispute"
                onClick={() => { setShowDisputeModal(false); setDisputeError(""); }}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  background: "transparent",
                  border: "1px solid #334155",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Resolve Dispute Modal ─────────────────────────────────────────── */}
      {showResolveModal && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowResolveModal(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, #1e293b, #0f172a)",
              border: "1px solid rgba(56,189,248,0.3)",
              borderRadius: "20px",
              padding: "32px",
              width: "min(500px, 92vw)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: "#38bdf8", fontWeight: 700, fontSize: "1.5rem", marginBottom: "8px" }}>
              ⚖️ Resolve Dispute
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "20px" }}>
              Choose whether to release the escrowed funds to the seller or refund them to the buyer.
            </p>

            <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
              <button
                type="button"
                id="btn-choose-release"
                onClick={() => setResolveTarget("RELEASED")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  background: resolveTarget === "RELEASED" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.03)",
                  border: `2px solid ${resolveTarget === "RELEASED" ? "#22c55e" : "#334155"}`,
                  color: resolveTarget === "RELEASED" ? "#4ade80" : "#94a3b8",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  transition: "all 0.2s",
                }}
              >
                💰 Release to Seller
              </button>
              <button
                type="button"
                id="btn-choose-refund"
                onClick={() => setResolveTarget("REFUNDED")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  background: resolveTarget === "REFUNDED" ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.03)",
                  border: `2px solid ${resolveTarget === "REFUNDED" ? "#f97316" : "#334155"}`,
                  color: resolveTarget === "REFUNDED" ? "#fb923c" : "#94a3b8",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  transition: "all 0.2s",
                }}
              >
                🔄 Refund to Buyer
              </button>
            </div>

            <textarea
              id="resolve-note-input"
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Resolution terms / arbitrator summary (e.g. Work verified according to agreement...)"
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "#f1f5f9",
                fontSize: "0.9rem",
                resize: "vertical",
                outline: "none",
                marginBottom: "16px",
              }}
            />

            {resolveError && (
              <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "12px" }}>
                {resolveError}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                id="btn-confirm-resolve"
                onClick={handleResolveDispute}
                disabled={resolveLoading}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  background: resolveLoading
                    ? "rgba(56,189,248,0.3)"
                    : "linear-gradient(135deg, #0284c7, #0369a1)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: resolveLoading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  transition: "opacity 0.2s",
                }}
              >
                {resolveLoading ? "Processing…" : `Confirm ${resolveTarget === "RELEASED" ? "Release" : "Refund"}`}
              </button>
              <button
                id="btn-cancel-resolve"
                onClick={() => { setShowResolveModal(false); setResolveError(""); }}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  background: "transparent",
                  border: "1px solid #334155",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EscrowDetails;