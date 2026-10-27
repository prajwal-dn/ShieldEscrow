import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { 
  HiOutlineClipboardCopy, 
  HiOutlineCheck, 
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineClock
} from "react-icons/hi";

function EscrowCard({ escrow }) {
  const navigate = useNavigate();
  const [copiedBuyer, setCopiedBuyer] = useState(false);
  const [copiedSeller, setCopiedSeller] = useState(false);

  const copyToClipboard = (text, type, e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "buyer") {
      setCopiedBuyer(true);
      setTimeout(() => setCopiedBuyer(false), 1800);
    } else {
      setCopiedSeller(true);
      setTimeout(() => setCopiedSeller(false), 1800);
    }
  };

  const truncate = (addr) => {
    if (!addr) return "N/A";
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div
      onClick={() => navigate(`/escrow/${escrow.id}`)}
      className="glass-panel-interactive p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-indigo-500/40 cursor-pointer flex flex-col justify-between group relative overflow-hidden transition-all duration-200"
    >
      <div>
        {/* Header row: ID & Status */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-indigo-300 border border-slate-200 dark:border-white/[0.08]">
              #{escrow.id}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <HiOutlineClock className="w-3.5 h-3.5" />
              {escrow.inspectionWindow || "72h Inspection"}
            </span>
          </div>

          <StatusBadge status={escrow.status} size="sm" />
        </div>

        {/* Title / Description */}
        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-200 line-clamp-1 mb-2">
          {escrow.description || "Escrow Agreement"}
        </h3>

        {/* Amount Box */}
        <div className="my-4 p-4 rounded-xl bg-indigo-50/70 dark:bg-white/[0.03] border border-indigo-100 dark:border-white/[0.08] flex items-baseline justify-between">
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Locked Capital
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-display font-black text-indigo-700 dark:text-indigo-300">
              {escrow.amount}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
              tNight / ADA
            </span>
          </div>
        </div>

        {/* Parties Grid */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100/70 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04] text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">Buyer:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                {truncate(escrow.buyerAddress)}
              </span>
              <button
                type="button"
                onClick={(e) => copyToClipboard(escrow.buyerAddress, "buyer", e)}
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded transition"
                title="Copy Buyer ID"
              >
                {copiedBuyer ? (
                  <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <HiOutlineClipboardCopy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100/70 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04] text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">Seller:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                {truncate(escrow.sellerAddress)}
              </span>
              <button
                type="button"
                onClick={(e) => copyToClipboard(escrow.sellerAddress, "seller", e)}
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded transition"
                title="Copy Seller ID"
              >
                {copiedSeller ? (
                  <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <HiOutlineClipboardCopy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <HiOutlineShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Preprod Verification
        </span>

        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-1 transition-all">
          Inspect Contract <HiOutlineArrowRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}

export default EscrowCard;