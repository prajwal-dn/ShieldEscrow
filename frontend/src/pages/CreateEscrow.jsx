import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { submitTransaction } from "../services/escrowService";
import { useNavigate, Link } from "react-router-dom";
import { 
  HiShieldCheck, 
  HiOutlineUser, 
  HiOutlineLockClosed, 
  HiOutlineScale, 
  HiOutlineClock, 
  HiOutlineArrowRight,
  HiOutlineCheckCircle, 
  HiOutlineCheck,
  HiOutlineShare,
  HiOutlineClipboardCopy
} from "react-icons/hi";

const CRITERIA_PRESETS = [
  {
    name: "Software & Web3 Code",
    criteria: "1. Complete code or item delivery matching written specifications.\n2. Zero critical defects or blocking bugs upon buyer testing.\n3. Source files or verified repository commit SHA provided.\n4. 72-hour buyer inspection window prior to automated settlement.",
    proof: "GitHub commit SHA, release tag, or verifiable staging environment URL.",
  },
  {
    name: "Physical Products & Hardware",
    criteria: "1. Item delivered in original, undamaged condition with matching serial numbers.\n2. Functional testing verifies all hardware operations work properly.\n3. All included accessories, manuals, and warranty documentation present.",
    proof: "Carrier tracking number with signed delivery confirmation.",
  },
  {
    name: "Domain & Digital IP",
    criteria: "1. Full administrative transfer of DNS ownership and registrar push.\n2. Auth code provided and transfer status confirmed by receiving registrar.\n3. Zero active intellectual property liens or ownership claims.",
    proof: "Registrar transfer verification screenshot or signed handover certificate.",
  },
  {
    name: "Milestone Consulting",
    criteria: "1. Presentation of agreed strategy deliverable or technical architecture document.\n2. Buyer validation of key performance metrics or consulting findings.\n3. All supplementary datasets and presentation decks transferred.",
    proof: "Signed milestone completion acceptance letter.",
  },
];

function CreateEscrow() {
  const { address: walletAddress, connected, initiateConnect } = useWallet();
  const { user, isAuthenticated, openRegister, generateStandardId } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    buyerAddress: "",
    sellerAddress: "",
    amount: "",
    description: "",
    inspectionWindow: "72 Hours",
    inspectionCriteria: CRITERIA_PRESETS[0].criteria,
    proofOfDelivery: CRITERIA_PRESETS[0].proof,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.buyerId) {
      setFormData((prev) => ({
        ...prev,
        buyerAddress: user.buyerId,
      }));
    } else if (connected && walletAddress && !formData.buyerAddress) {
      setFormData((prev) => ({
        ...prev,
        buyerAddress: walletAddress,
      }));
    }
  }, [isAuthenticated, user, connected, walletAddress]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      inspectionCriteria: preset.criteria,
      proofOfDelivery: preset.proof,
    }));
  };

  const handleGenerateSellerId = () => {
    const generated = generateStandardId("SEL");
    setFormData((prev) => ({ ...prev, sellerAddress: generated }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.buyerAddress.trim()) {
      newErrors.buyerAddress = "Standardized Buyer ID or wallet is required";
    }

    if (!formData.sellerAddress.trim()) {
      newErrors.sellerAddress = "Standardized Seller ID or wallet is required";
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Escrow amount must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product or agreement description is required";
    }

    if (!formData.inspectionCriteria.trim()) {
      newErrors.inspectionCriteria = "Acceptance and inspection criteria are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Execute on-chain funding transaction with ZK proof simulation
      const txResult = await submitTransaction(null, "create");
      const txHash = txResult.txHash;

      const payload = {
        ...formData,
        txHash,
      };

      const response = await api.post("/api/escrows", payload);

      // Open elegant success modal instead of native browser alert
      setSuccessModalData({
        id: response.data?.id,
        txHash,
        amount: formData.amount,
        buyer: formData.buyerAddress,
        seller: formData.sellerAddress,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to create escrow: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-cyan-500/10 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-cyan-500/20">
            ZK SMART CONTRACT PROTOCOL
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Midnight Preprod Lock
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white">
          Create Decentralized Escrow
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Lock capital into a zero-knowledge smart contract. Settlement is cryptographically guaranteed once acceptance criteria are fulfilled.
        </p>
      </div>

      {/* Account Verification Suggestion Banner */}
      {!isAuthenticated && (
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-indigo-200 dark:border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-200 dark:border-cyan-500/20 shrink-0 mt-0.5">
              <HiShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Standardized Account Recommended
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Register your Gmail to get verified User, Buyer, and Seller IDs for transaction non-repudiation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openRegister}
            className="btn-shimmer-primary px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap self-start sm:self-center"
          >
            Register Verified ID
          </button>
        </div>
      )}

      {/* Main Grid: Form + Real-Time Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Container (2 Cols) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-8">
            
            {/* SECTION 1: Counterparty Identification */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Counterparty Identification
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Buyer ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Buyer Identifier (Depositor)
                  </label>
                  <input
                    type="text"
                    name="buyerAddress"
                    value={formData.buyerAddress}
                    onChange={handleChange}
                    placeholder="e.g. BUY-109283 or wallet address"
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                  {user?.buyerId && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1.5 flex items-center gap-1">
                      <HiOutlineCheck className="w-3.5 h-3.5" /> Auto-linked to your account ({user.buyerId})
                    </span>
                  )}
                  {errors.buyerAddress && (
                    <p className="text-rose-500 text-xs mt-1">{errors.buyerAddress}</p>
                  )}
                </div>

                {/* Seller ID */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Seller Identifier (Beneficiary)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSellerId}
                      className="text-[11px] font-mono text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      + Generate ID
                    </button>
                  </div>
                  <input
                    type="text"
                    name="sellerAddress"
                    value={formData.sellerAddress}
                    onChange={handleChange}
                    placeholder="e.g. SEL-391048 or wallet address"
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                  {errors.sellerAddress && (
                    <p className="text-rose-500 text-xs mt-1">{errors.sellerAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Agreement & Capital Lock */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-cyan-500/20 text-indigo-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Agreement Details & Capital Lock
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Locked Escrow Capital (tNight / ADA)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="e.g. 5000"
                      className="glass-input w-full pl-3.5 pr-20 py-2.5 rounded-xl text-xs font-mono font-bold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-indigo-600 dark:text-cyan-400 font-semibold pointer-events-none">
                      tNight
                    </span>
                  </div>
                  {errors.amount && (
                    <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Inspection Window */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Inspection Window
                  </label>
                  <select
                    name="inspectionWindow"
                    value={formData.inspectionWindow}
                    onChange={handleChange}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"
                  >
                    <option value="24 Hours" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">24 Hours (Fast verification)</option>
                    <option value="48 Hours" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">48 Hours</option>
                    <option value="72 Hours" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">72 Hours (Standard)</option>
                    <option value="7 Days" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">7 Days (Comprehensive QA)</option>
                    <option value="14 Days" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">14 Days (Complex contracts)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Agreement Title / Deliverable Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. Full-Stack Web3 DApp Development & Smart Contract Deployment"
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"
                />
                {errors.description && (
                  <p className="text-rose-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* SECTION 3: Inspection & Acceptance Judging Criteria */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                    3
                  </span>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Inspection & Judging Criteria
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-cyan-400">
                  Strict Acceptance Benchmarks
                </span>
              </div>

              {/* Presets Chips */}
              <div className="mb-4">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mb-2">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {CRITERIA_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium glass-card-subtle hover:bg-slate-200/70 dark:hover:bg-white/[0.08] hover:text-indigo-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-white/[0.08] transition cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Criteria Checklist */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Quality Standards & Acceptance Checklist
                  </label>
                  <textarea
                    rows={4}
                    name="inspectionCriteria"
                    value={formData.inspectionCriteria}
                    onChange={handleChange}
                    placeholder="Enumerate the required acceptance benchmarks..."
                    className="glass-input w-full p-3.5 rounded-xl text-xs leading-relaxed font-sans"
                  />
                  {errors.inspectionCriteria && (
                    <p className="text-rose-500 text-xs mt-1">{errors.inspectionCriteria}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mandatory Proof of Delivery / Handover
                  </label>
                  <input
                    type="text"
                    name="proofOfDelivery"
                    value={formData.proofOfDelivery}
                    onChange={handleChange}
                    placeholder="e.g. Carrier tracking number, GitHub SHA, or signed certificate"
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-shimmer-primary w-full py-4 rounded-2xl text-sm font-bold tracking-wide shadow-xl shadow-indigo-600/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    <span>Creating Escrow (Preprod Testnet Simulation)...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <HiOutlineLockClosed className="w-5 h-5" />
                    <span>Create & Lock Escrow (Testnet)</span>
                  </span>
                )}
              </button>
              <p className="text-[11px] font-mono text-center text-amber-600 dark:text-amber-400/90 mt-2.5 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></span>
                Preprod Testnet Simulation — No real mainnet funds are transferred.
              </p>
            </div>

          </form>
        </div>

        {/* Real-Time Live Preview Sidebar (1 Col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-4">
            <div className="p-1 rounded-3xl bg-gradient-to-b from-indigo-500/20 dark:from-cyan-500/20 to-transparent">
              <div className="glass-panel p-6 rounded-[22px] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                    Live Escrow Preview
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 dark:bg-cyan-500/10 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-cyan-500/20">
                    PRE-FLIGHT
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mb-1">
                    AGREEMENT
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {formData.description || "Untitled Agreement"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.06] flex items-baseline justify-between">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">LOCKED CAPITAL</span>
                  <div className="text-right">
                    <span className="text-xl font-display font-black text-indigo-600 dark:text-cyan-300">
                      {formData.amount || "0"}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-1">tNight</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100/70 dark:bg-black/20">
                    <span className="text-slate-500">BUYER:</span>
                    <span className="text-indigo-600 dark:text-cyan-300 font-medium truncate max-w-[150px]">
                      {formData.buyerAddress || "Not specified"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100/70 dark:bg-black/20">
                    <span className="text-slate-500">SELLER:</span>
                    <span className="text-purple-600 dark:text-purple-300 font-medium truncate max-w-[150px]">
                      {formData.sellerAddress || "Not specified"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100/70 dark:bg-black/20">
                    <span className="text-slate-500">INSPECTION:</span>
                    <span className="text-slate-800 dark:text-slate-300 font-medium">
                      {formData.inspectionWindow}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.06] text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Protocol Cut:</span>
                    <span>0.00% (Free)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Network Gas:</span>
                    <span>&lt; 0.05 tNight</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card-subtle border border-slate-200/80 dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
              💡 Funds remain locked in the Midnight smart contract until you explicitly confirm release in your dashboard.
            </div>
          </div>
        </div>

      </div>

      {/* Modern Success Confirmation Modal */}
      {successModalData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/30 shadow-2xl text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <HiOutlineCheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-1">
              Escrow Deployed & Secured!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
              Funds are cryptographically locked on Midnight Preprod testnet.
            </p>

            <div className="p-4 rounded-2xl glass-card-subtle border border-slate-200/80 dark:border-white/[0.08] text-left space-y-2 mb-6 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Escrow ID:</span>
                <span className="text-indigo-600 dark:text-cyan-300 font-bold">#{successModalData.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Locked Capital:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{successModalData.amount} tNight</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] mb-1">TRANSACTION HASH:</span>
                <span className="text-slate-700 dark:text-slate-300 break-all select-all text-[11px]">
                  {successModalData.txHash}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  const link = `${window.location.origin}/escrow/${successModalData.id}`;
                  navigator.clipboard.writeText(link);
                  setCopiedInvite(true);
                  setTimeout(() => setCopiedInvite(false), 2500);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-cyan-500/10 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-cyan-500/30 flex items-center justify-center gap-2 hover:bg-indigo-100 transition cursor-pointer"
              >
                {copiedInvite ? (
                  <>
                    <HiOutlineCheck className="w-4 h-4 text-emerald-500" />
                    <span>Treaty Session Link Copied!</span>
                  </>
                ) : (
                  <>
                    <HiOutlineShare className="w-4 h-4" />
                    <span>Copy Seller Treaty Session Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/escrow/${successModalData.id}`)}
                className="btn-shimmer-primary flex-1 py-3 rounded-xl text-xs font-semibold"
              >
                View Escrow Details →
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-glass-secondary px-4 py-3 rounded-xl text-xs font-semibold"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CreateEscrow;