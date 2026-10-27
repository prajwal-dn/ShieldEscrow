import { listWallets } from "../wallet/selectWallet";
import { HiOutlineX, HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineExternalLink } from "react-icons/hi";

export default function WalletPickerModal({ onSelect, onClose }) {
  const wallets = listWallets();

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl shadow-black/80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient circle */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <HiOutlineShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Connect Wallet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Close modal"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Select an authorized Web3 wallet extension to sign zero-knowledge proofs and manage escrow deposits.
        </p>

        {wallets.length === 0 ? (
          <div className="p-6 rounded-2xl glass-card-subtle border border-rose-500/30 text-center">
            <p className="text-sm font-semibold text-rose-300 mb-2">
              No Compatible Wallet Detected
            </p>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Please install Midnight Lace or a Cardano CIP-30 compatible wallet extension (e.g., Nightly, Lace) to interact with ShieldEscrow.
            </p>
            <a
              href="https://midnight.network"
              target="_blank"
              rel="noreferrer"
              className="btn-shimmer-primary w-full py-2.5 rounded-xl text-xs font-semibold"
            >
              Get Midnight Lace Wallet <HiOutlineExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((w) => (
              <button
                key={w.key}
                id={`wallet-option-${w.key}`}
                onClick={() => onSelect(w)}
                className="w-full flex items-center justify-between p-4 rounded-2xl glass-card-subtle hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-200 group text-left cursor-pointer shadow-sm hover:shadow-cyan-500/10"
              >
                <div className="flex items-center gap-3.5">
                  {w.icon ? (
                    <img src={w.icon} alt={w.name} className="w-10 h-10 rounded-xl object-cover border border-white/[0.1]" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30">
                      {w.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {w.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {w.network === "midnight" ? "Midnight Preprod" : "Cardano Preprod"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover:bg-cyan-500/20 group-hover:text-cyan-300 text-slate-400 flex items-center justify-center transition-all duration-200">
                  <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
          <p className="text-[11px] font-mono text-slate-400">
            🔒 Non-custodial — Private keys never leave your device
          </p>
        </div>
      </div>
    </div>
  );
}
