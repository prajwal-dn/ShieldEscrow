import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { HiOutlineCreditCard, HiOutlineCheck, HiOutlineClipboardCopy, HiOutlineExclamationCircle } from "react-icons/hi";

function WalletStatus() {
  const { connected, address, walletError, initiateConnect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = address 
    ? `${address.slice(0, 8)}...${address.slice(-6)}` 
    : "";

  return (
    <div className="flex items-center gap-3">
      {walletError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs sm:text-sm">
          <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" />
          <span>{walletError}</span>
        </div>
      )}
      {connected ? (
        <div className="flex items-center gap-2 p-1.5 pl-3 pr-2 rounded-xl glass-card-subtle border border-cyan-500/20 bg-slate-900/60 shadow-lg shadow-cyan-950/20">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-mono font-medium text-slate-200">
              {truncatedAddress}
            </span>
          </div>

          <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy address"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition"
          >
            {copied ? (
              <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <HiOutlineClipboardCopy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            id="btn-disconnect-wallet"
            onClick={disconnect}
            className="px-2.5 py-1 text-xs font-semibold text-rose-400/90 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          id="btn-connect-wallet"
          onClick={initiateConnect}
          className="btn-shimmer-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide"
        >
          <HiOutlineCreditCard className="w-4 h-4" />
          <span>Connect Wallet</span>
        </button>
      )}
    </div>
  );
}

export default WalletStatus;