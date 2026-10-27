import { useEffect, useState, useRef } from "react";
import { 
  HiOutlineShieldCheck, 
  HiOutlineCheckCircle, 
  HiOutlineLockClosed, 
  HiOutlineExclamationCircle, 
  HiOutlineCubeTransparent,
  HiOutlineX
} from "react-icons/hi";

const EVENT_META = {
  CREATED:   { icon: <HiOutlineShieldCheck className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />, label: "Escrow Created", border: "border-indigo-200 dark:border-cyan-500/30" },
  FUNDED:    { icon: <HiOutlineLockClosed className="w-5 h-5 text-amber-500" />, label: "Escrow Funded", border: "border-amber-500/30" },
  COMPLETED: { icon: <HiOutlineCheckCircle className="w-5 h-5 text-purple-500" />, label: "Work Completed", border: "border-purple-500/30" },
  RELEASED:  { icon: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />, label: "Funds Released", border: "border-emerald-500/30" },
  DISPUTED:  { icon: <HiOutlineExclamationCircle className="w-5 h-5 text-rose-500" />, label: "Dispute Raised", border: "border-rose-500/30" },
  SYNCED:    { icon: <HiOutlineCubeTransparent className="w-5 h-5 text-indigo-500" />, label: "On-Chain Synced", border: "border-indigo-500/30" },
};

let toastIdCounter = 0;

export default function NotificationToast({ notification }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  useEffect(() => {
    if (!notification) return;
    const id = ++toastIdCounter;
    const timers = timersRef.current;
    setToasts((prev) => [...prev, { ...notification, _toastId: id }]);

    timers[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t._toastId !== id));
      delete timers[id];
    }, 6000);

    return () => {
      if (timers[id]) {
        clearTimeout(timers[id]);
        delete timers[id];
      }
    };
  }, [notification]);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t._toastId !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const meta = EVENT_META[toast.eventType] || {
          icon: <HiOutlineShieldCheck className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />,
          label: toast.eventType || "Notification",
          border: "border-indigo-200 dark:border-cyan-500/30",
        };

        return (
          <div
            key={toast._toastId}
            className={`pointer-events-auto p-4 rounded-2xl glass-panel ${meta.border} shadow-xl flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-bottom-5`}
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] shrink-0 border border-slate-200/80 dark:border-white/[0.08]">
              {meta.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white tracking-wide">
                  {meta.label}
                </span>
                <span className="text-[10px] font-mono text-indigo-700 dark:text-cyan-300 bg-indigo-50 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded">
                  Escrow #{toast.escrowId}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {toast.message || `State transition to ${toast.status}`}
              </p>
            </div>

            <button
              onClick={() => dismissToast(toast._toastId)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
