import { useState } from "react";
import { 
  HiOutlineClipboardCopy, 
  HiOutlineCheck, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle, 
  HiOutlineSparkles
} from "react-icons/hi";

function TransactionStatus({ state, hash }) {
  const [copied, setCopied] = useState(false);

  const getStatus = () => {
    switch (state) {
      case "waiting-signature":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300",
          icon: <HiOutlineClock className="w-5 h-5 text-amber-500 animate-spin" />,
          title: "Waiting for Wallet Signature",
          desc: "Please review and approve the cryptographic proof in your Midnight/Cardano wallet extension.",
        };

      case "submitting":
        return {
          bg: "bg-indigo-500/10 dark:bg-cyan-500/10 border-indigo-200 dark:border-cyan-500/30 text-indigo-800 dark:text-cyan-300",
          icon: <HiOutlineSparkles className="w-5 h-5 text-indigo-600 dark:text-cyan-400 animate-pulse" />,
          title: "Submitting to ZK Ledger",
          desc: "Broadcasting zero-knowledge transaction to Midnight preprod nodes for consensus.",
        };

      case "success":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300",
          icon: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
          title: "Transaction Confirmed On-Chain",
          desc: "Smart contract state transition finalized successfully with immutable non-repudiation.",
        };

      case "error":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300",
          icon: <HiOutlineXCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
          title: "Transaction Rejected",
          desc: "The transaction was cancelled or encountered a validation error.",
        };

      default:
        return {
          bg: "glass-card-subtle border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400",
          icon: <HiOutlineClock className="w-5 h-5 text-slate-400" />,
          title: "Ready for Settlement",
          desc: "No pending blockchain transaction.",
        };
    }
  };

  const status = getStatus();

  const handleCopy = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state === "idle" && !hash) return null;

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${status.bg} shadow-md my-6`}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.1] shrink-0">
          {status.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
              {status.title}
            </h4>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Midnight Preprod
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30">
                Testnet Simulation
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300/90 leading-relaxed mb-3">
            {status.desc}
          </p>

          {hash && (
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Tx Hash:</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono text-indigo-600 dark:text-cyan-300 hover:text-indigo-700 dark:hover:text-cyan-200 bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-200 dark:border-cyan-500/20 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineClipboardCopy className="w-3.5 h-3.5" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1.5 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                {hash}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionStatus;