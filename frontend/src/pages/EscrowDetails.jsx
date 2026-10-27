import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import ActivityTimeline from "../components/ActivityTimeline";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import TransactionStatus from "../components/TransactionStatus";
import { useWallet } from "../context/WalletContext";
import useEscrowNotifications from "../hooks/useEscrowNotifications";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { signTransaction, submitTransaction } from "../services/escrowService";
import { 
  HiShieldCheck, 
  HiOutlineLockClosed, 
  HiOutlineCheckCircle, 
  HiOutlineScale, 
  HiOutlineClock, 
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
  HiOutlineX,
  HiOutlineShare,
  HiOutlineUserAdd
} from "react-icons/hi";
import AIVerificationPanel from "../components/AIVerificationPanel";

const ACTIVE_STATUSES = ["CREATED", "FUNDED", "COMPLETED", "AI_APPROVED", "DELIVERY_FLAGGED"];

function EscrowDetails() {
  const { id } = useParams();
  const { connected, address, walletApi, initiateConnect } = useWallet();
  const { user } = useAuth();

  const [escrow, setEscrow] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "criteria" | "timeline"
  const [transactionState, setTransactionState] = useState("idle");
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

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
      setError("Failed to load escrow details from database.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEscrow();
  }, [fetchEscrow]);

  useEffect(() => {
    if (!lastNotification) return;
    fetchEscrow();
  }, [lastNotification, fetchEscrow]);

  const handleCopy = (key, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
        note: resolveNote || (resolveTarget === "RELEASED" ? "Funds released to seller following arbitration" : "Funds refunded to buyer following arbitration"),
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

  if (loading) return <Loader message="Decrypting on-chain escrow contract..." />;

  if (error || !escrow) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="p-8 rounded-3xl glass-panel border border-rose-500/30">
          <HiOutlineExclamationCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Escrow Contract Not Found</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">{error || "The requested escrow ID does not exist."}</p>
          <Link to="/dashboard" className="btn-shimmer-primary px-6 py-2.5 rounded-xl text-xs font-semibold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isBuyer = userKeys.includes(buyer);
  const isSeller = userKeys.includes(seller);

  // If user is not yet authorized, check if this is an open invite for a seller to join
  const canJoinAsSeller = !isAuthorized && user?.sellerId && (!escrow.sellerJoined || escrow.sellerAddress === "SEL-PENDING" || !escrow.sellerAddress);

  const handleJoinAsSeller = async () => {
    try {
      await api.post(`/api/escrows/${id}/approve`, {
        actorAddress: user.sellerId,
        sellerAddress: user.sellerId,
      });
      await fetchEscrow();
    } catch (err) {
      console.error("Failed to join contract:", err);
    }
  };

  if (!isAuthorized && !canJoinAsSeller) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="p-8 rounded-3xl glass-panel border border-amber-500/30">
          <HiShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Restricted Escrow Contract</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            This agreement is cryptographically shielded. Your account ({user?.userId || "guest"}) is not an authorized buyer or seller for this contract.
          </p>
          <Link to="/dashboard" className="btn-shimmer-primary px-6 py-2.5 rounded-xl text-xs font-semibold">
            Return to Your Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const canRelease = escrow.status !== "RELEASED" && escrow.status !== "REFUNDED" && escrow.status !== "DISPUTED";
  const canComplete = escrow.status === "CREATED" || escrow.status === "FUNDED";

  // Compute active lifecycle step (1 to 3)
  const getStepIndex = () => {
    if (escrow.status === "RELEASED" || escrow.status === "REFUNDED") return 3;
    if (escrow.status === "COMPLETED") return 2;
    if (escrow.status === "DISPUTED") return -1;
    return 1;
  };

  const stepIndex = getStepIndex();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2.5 rounded-xl glass-card-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] transition"
            title="Back to Dashboard"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-400">
                ESCROW #{escrow.id}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Midnight Preprod ZK Contract
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              {escrow.description || `Escrow #${escrow.id}`}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={escrow.status} />
        </div>
      </div>

      {/* Lifecycle Stepper Bar */}
      <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex items-center justify-between max-w-3xl mx-auto relative">
          
          {/* Background progress line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 dark:bg-white/[0.08] z-0" />
          
          {/* Step 1: Locked */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
              stepIndex >= 1 
                ? "bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-4 ring-white dark:ring-[#070b14]" 
                : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ring-4 ring-white dark:ring-[#070b14]"
            }`}>
              <HiOutlineLockClosed className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mt-2">
              1. Funds Locked
            </span>
          </div>

          {/* Step 2: Work Completed */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
              stepIndex >= 2 
                ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 ring-4 ring-white dark:ring-[#070b14]" 
                : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ring-4 ring-white dark:ring-[#070b14]"
            }`}>
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mt-2">
              2. Work Delivered
            </span>
          </div>

          {/* Step 3: Settled / Released */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
              stepIndex >= 3 
                ? "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-white dark:ring-[#070b14]" 
                : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ring-4 ring-white dark:ring-[#070b14]"
            }`}>
              <HiShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mt-2">
              3. Final Settlement
            </span>
          </div>

        </div>

        {escrow.status === "DISPUTED" && (
          <div className="mt-4 pt-3 border-t border-rose-500/20 text-center">
            <span className="text-xs font-mono font-semibold text-rose-500 dark:text-rose-400 flex items-center justify-center gap-1.5">
              <HiOutlineExclamationCircle className="w-4 h-4" />
              Contract is currently under arbitration. Mutual release or dispute decision required.
            </span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
            activeTab === "overview"
              ? "bg-white dark:bg-indigo-500/30 text-indigo-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <HiShieldCheck className="w-4 h-4" />
          <span>Overview & Settlement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("criteria")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
            activeTab === "criteria"
              ? "bg-white dark:bg-indigo-500/30 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-purple-500/30 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <HiOutlineScale className="w-4 h-4" />
          <span>Inspection & Criteria</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
            activeTab === "timeline"
              ? "bg-white dark:bg-indigo-500/30 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <HiOutlineClock className="w-4 h-4" />
          <span>Audit Timeline</span>
        </button>
      </div>

      {/* Main Content Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        
        {/* ── TAB 1: OVERVIEW & ACTIONS ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            
            {/* Top Financial Stats Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-cyan-500/10 dark:via-indigo-500/10 dark:to-transparent border border-indigo-200/80 dark:border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Locked Escrow Capital
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-black text-slate-900 dark:text-white">
                    {escrow.amount}
                  </span>
                  <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-cyan-400">
                    tNight / ADA
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Inspection Timelock
                </span>
                <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center sm:justify-end gap-1.5">
                  <HiOutlineClock className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                  {escrow.inspectionWindow || "72 Hours"}
                </span>
              </div>
            </div>

            {/* Counterparties Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* Buyer */}
              <div className="p-4 rounded-2xl glass-card-subtle border border-slate-200/80 dark:border-white/[0.08] relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-cyan-400 uppercase tracking-wider font-semibold">
                    Buyer Identifier (Depositor)
                  </span>
                  <button
                    onClick={() => handleCopy("buyer", escrow.buyerAddress)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-300 transition cursor-pointer"
                    title="Copy Buyer ID"
                  >
                    {copiedKey === "buyer" ? (
                      <HiOutlineCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <HiOutlineClipboardCopy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white break-all select-all">
                  {escrow.buyerAddress}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Authorized Depositor Signer</span>
                </div>
              </div>

              {/* Seller */}
              <div className="p-4 rounded-2xl glass-card-subtle border border-slate-200/80 dark:border-white/[0.08] relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-wider font-semibold">
                    Seller Identifier (Beneficiary)
                  </span>
                  <button
                    onClick={() => handleCopy("seller", escrow.sellerAddress)}
                    className="p-1 rounded text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition cursor-pointer"
                    title="Copy Seller ID"
                  >
                    {copiedKey === "seller" ? (
                      <HiOutlineCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <HiOutlineClipboardCopy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white break-all select-all">
                  {escrow.sellerAddress}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <HiOutlineCheckCircle className="w-3.5 h-3.5 text-purple-500" />
                  <span>Settlement Recipient</span>
                </div>
              </div>

            </div>

            {/* Wallet Connection Requirement Notice */}
            {!connected && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HiOutlineLockClosed className="w-4 h-4 text-amber-500" />
                  <span>Connect your Midnight wallet extension to sign and execute actions on this escrow.</span>
                </div>
                <button
                  onClick={initiateConnect}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold text-slate-900 dark:text-white transition whitespace-nowrap cursor-pointer"
                >
                  Connect
                </button>
              </div>
            )}

            {/* Shared Treaty Session Invitation Link */}
            <div className="p-4 rounded-2xl glass-card-subtle border border-indigo-200/80 dark:border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-200 dark:border-cyan-500/20">
                  <HiOutlineShare className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Common Treaty Session
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Share this link with your counterparty so both parties can coordinate in this shared session.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy("sessionLink", window.location.href)}
                className="btn-glass-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer self-start sm:self-center"
              >
                {copiedKey === "sessionLink" ? (
                  <HiOutlineCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <HiOutlineClipboardCopy className="w-4 h-4" />
                )}
                <span>{copiedKey === "sessionLink" ? "Link Copied!" : "Copy Session Link"}</span>
              </button>
            </div>

            {/* Seller Join Banner if opening an open invite */}
            {canJoinAsSeller && (
              <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <HiOutlineUserAdd className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Join as Contract Seller</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Accept this treaty invite with your Seller ID ({user.sellerId}) to bind yourself to this escrow agreement.</p>
                  </div>
                </div>
                <button
                  onClick={handleJoinAsSeller}
                  className="btn-shimmer-primary px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap"
                >
                  Accept & Join Treaty
                </button>
              </div>
            )}

            {/* AI Deliverable & Rule Inspection Engine */}
            <AIVerificationPanel
              escrow={escrow}
              isSeller={isSeller}
              isBuyer={isBuyer}
              onVerificationComplete={() => {
                fetchEscrow();
              }}
            />

            {/* Action Buttons Section */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.06] space-y-4">
              <div className="flex flex-wrap gap-4">
                
                {/* Complete Work */}
                {canComplete && (
                  <button
                    id="btn-complete-work"
                    onClick={handleCompleteWork}
                    className="btn-shimmer-primary flex-1 py-4 rounded-2xl text-sm font-bold tracking-wide"
                  >
                    {!connected ? "Connect Wallet to Complete" : "Mark Work Completed"}
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
                    className="btn-shimmer-emerald flex-1 py-4 rounded-2xl text-sm font-bold tracking-wide"
                  >
                    {!connected
                      ? "Connect Wallet to Release"
                      : transactionState === "waiting-signature"
                      ? "Waiting for Signature…"
                      : transactionState === "submitting"
                      ? "Submitting Proof…"
                      : "Release Funds to Seller"}
                  </button>
                )}

                {/* Raise Dispute */}
                {ACTIVE_STATUSES.includes(escrow.status) && (
                  <button
                    id="btn-raise-dispute"
                    onClick={() => {
                      if (!connected) { initiateConnect(); return; }
                      setShowDisputeModal(true);
                    }}
                    className="btn-glass-danger px-6 py-4 rounded-2xl text-sm font-bold tracking-wide"
                  >
                    <HiOutlineExclamationCircle className="w-5 h-5" />
                    <span>Raise Dispute</span>
                  </button>
                )}
              </div>

              {/* Status Specific Banners */}
              {escrow.status === "RELEASED" && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-center font-bold text-base flex items-center justify-center gap-2">
                  <HiOutlineCheckCircle className="w-6 h-6" />
                  <span>Funds Successfully Released & Settled to Seller</span>
                </div>
              )}

              {escrow.status === "REFUNDED" && (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-700 dark:text-orange-400 text-center font-bold text-base flex items-center justify-center gap-2">
                  <HiOutlineCheckCircle className="w-6 h-6" />
                  <span>Funds Refunded to Buyer Following Resolution</span>
                </div>
              )}

              {escrow.status === "DISPUTED" && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <HiOutlineExclamationCircle className="w-6 h-6 text-rose-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Dispute In Progress</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Funds are cryptographically frozen pending arbitrator resolution.</p>
                    </div>
                  </div>
                  <button
                    id="btn-open-resolve-dispute"
                    onClick={() => {
                      if (!connected) { initiateConnect(); return; }
                      setShowResolveModal(true);
                    }}
                    className="btn-shimmer-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Resolve Dispute
                  </button>
                </div>
              )}
            </div>

            {/* Transaction Status Box */}
            <TransactionStatus state={transactionState} hash={transactionHash} />

          </div>
        )}

        {/* ── TAB 2: INSPECTION & ACCEPTANCE CRITERIA ── */}
        {activeTab === "criteria" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                ACCEPTANCE FRAMEWORK
              </span>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                Inspection & Quality Standards
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                This escrow is governed by verifiable benchmarks. Funds remain locked until the buyer confirms the criteria have been fulfilled.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-card-subtle border border-indigo-200 dark:border-cyan-500/20 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 shrink-0">
                <HiOutlineClock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                  Active Inspection Window
                </span>
                <span className="text-base font-bold text-indigo-600 dark:text-cyan-300">
                  {escrow.inspectionWindow || "72 Hours"}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  The buyer has this window following deliverable handover to inspect deliverables before automated settlement.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-card-subtle border border-slate-200/80 dark:border-white/[0.08]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                Agreed Quality Standards & Checklist
              </h4>
              <div className="whitespace-pre-line text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-slate-100/80 dark:bg-black/30 p-4 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                {escrow.inspectionCriteria || "1. Deliverable must strictly match agreed technical and quality specifications.\n2. No critical vulnerabilities, defects, or missing components.\n3. Handover assets and documentation delivered."}
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-card-subtle border border-slate-200/80 dark:border-white/[0.08]">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Mandatory Proof of Delivery Requirement
              </h4>
              <p className="font-mono text-xs text-indigo-700 dark:text-cyan-300 bg-slate-100/80 dark:bg-black/30 p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                {escrow.proofOfDelivery || "Carrier tracking code, verifiable Git commit SHA, or signed handover receipt."}
              </p>
            </div>

            {/* Criteria Tab Actions */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.06] flex gap-3">
              {canRelease && (
                <button
                  onClick={handleReleaseFunds}
                  className="btn-shimmer-emerald flex-1 py-3 rounded-xl text-xs font-bold"
                >
                  Approve Criteria & Release Funds
                </button>
              )}
              {ACTIVE_STATUSES.includes(escrow.status) && (
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="btn-glass-danger px-5 py-3 rounded-xl text-xs font-bold"
                >
                  Dispute Non-Compliance
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: AUDIT TIMELINE ── */}
        {activeTab === "timeline" && (
          <div>
            <ActivityTimeline escrowId={id} />
          </div>
        )}

      </div>

      {/* ── Dispute Modal ─────────────────────────────────────────────────── */}
      {showDisputeModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowDisputeModal(false)}
        >
          <div
            className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/30 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <HiOutlineExclamationCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  Raise a Dispute
                </h3>
              </div>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Describe the issue or non-compliance. Raising a dispute will cryptographically freeze this escrow until resolved.
            </p>

            <textarea
              id="dispute-reason-input"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="e.g. Deliverable failed acceptance testing or diverged from specifications..."
              rows={4}
              className="glass-input w-full p-3 rounded-xl text-xs font-sans mb-3 border-rose-500/30 focus:border-rose-500"
            />

            {disputeError && (
              <p className="text-rose-500 text-xs mb-3">{disputeError}</p>
            )}

            <div className="flex gap-3">
              <button
                id="btn-confirm-dispute"
                onClick={handleRaiseDispute}
                disabled={disputeLoading}
                className="btn-glass-danger flex-1 py-3 rounded-xl text-xs font-bold"
              >
                {disputeLoading ? "Submitting..." : "Confirm Dispute"}
              </button>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="btn-glass-secondary px-5 py-3 rounded-xl text-xs font-semibold"
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowResolveModal(false)}
        >
          <div
            className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-indigo-200 dark:border-cyan-500/30 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-200 dark:border-cyan-500/20">
                  <HiOutlineScale className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  Resolve Dispute (Arbitration)
                </h3>
              </div>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Choose the arbitration determination: release funds to seller or refund back to buyer.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                id="btn-choose-release"
                onClick={() => setResolveTarget("RELEASED")}
                className={`p-3.5 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  resolveTarget === "RELEASED"
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/60 shadow-md"
                    : "glass-card-subtle text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]"
                }`}
              >
                <HiOutlineCheckCircle className="w-5 h-5" />
                <span>Release to Seller</span>
              </button>

              <button
                type="button"
                id="btn-choose-refund"
                onClick={() => setResolveTarget("REFUNDED")}
                className={`p-3.5 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  resolveTarget === "REFUNDED"
                    ? "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-2 border-orange-500/60 shadow-md"
                    : "glass-card-subtle text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]"
                }`}
              >
                <HiOutlineLockClosed className="w-5 h-5" />
                <span>Refund to Buyer</span>
              </button>
            </div>

            <textarea
              id="resolve-note-input"
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Arbitration findings or settlement summary note..."
              rows={3}
              className="glass-input w-full p-3 rounded-xl text-xs font-sans mb-3"
            />

            {resolveError && (
              <p className="text-rose-500 text-xs mb-3">{resolveError}</p>
            )}

            <div className="flex gap-3">
              <button
                id="btn-confirm-resolve"
                onClick={handleResolveDispute}
                disabled={resolveLoading}
                className="btn-shimmer-primary flex-1 py-3 rounded-xl text-xs font-bold"
              >
                {resolveLoading ? "Processing..." : `Confirm ${resolveTarget === "RELEASED" ? "Release" : "Refund"}`}
              </button>
              <button
                onClick={() => setShowResolveModal(false)}
                className="btn-glass-secondary px-5 py-3 rounded-xl text-xs font-semibold"
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