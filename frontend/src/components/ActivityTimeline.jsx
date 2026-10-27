import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import useEscrowNotifications from "../hooks/useEscrowNotifications.js";
import { 
  HiOutlineCheckCircle, 
  HiOutlineLockClosed, 
  HiOutlineExclamationCircle, 
  HiOutlineSparkles,
  HiOutlineClock
} from "react-icons/hi";

const EVENT_CONFIG = {
  CREATED: {
    badge: "glow-badge-cyan",
    dot: "bg-cyan-500",
    icon: <HiOutlineSparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />,
    label: "Escrow Created & Registered",
  },
  FUNDED: {
    badge: "glow-badge-amber",
    dot: "bg-amber-500",
    icon: <HiOutlineLockClosed className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    label: "Capital Locked On-Chain",
  },
  COMPLETED: {
    badge: "glow-badge-purple",
    dot: "bg-purple-500",
    icon: <HiOutlineCheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    label: "Work Delivered & Completed",
  },
  RELEASED: {
    badge: "glow-badge-emerald",
    dot: "bg-emerald-500",
    icon: <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    label: "Funds Released & Settled",
  },
  DISPUTED: {
    badge: "glow-badge-rose",
    dot: "bg-rose-500",
    icon: <HiOutlineExclamationCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    label: "Dispute Arbitration Raised",
  },
};

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityTimeline({ escrowId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const { lastNotification } = useEscrowNotifications(escrowId);

  const fetchEvents = useCallback(() => {
    if (!escrowId) return;
    api.get(`/api/escrows/${escrowId}/events`)
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [escrowId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (!lastNotification) return;
    fetchEvents();
  }, [lastNotification, fetchEvents]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <HiOutlineClock className="w-6 h-6 text-indigo-600 dark:text-cyan-400 animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading immutable audit log...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-8 rounded-2xl glass-card-subtle border border-slate-200/80 dark:border-white/[0.06] text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">No lifecycle events recorded for this escrow yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Cryptographic Audit Trail
        </h3>
        <span className="text-xs font-mono text-indigo-600 dark:text-cyan-400 font-semibold">
          {events.length} State Record{events.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-indigo-500/40 dark:before:from-cyan-500/50 before:via-indigo-500/20 before:to-transparent">
        {events.map((ev, idx) => {
          const cfg = EVENT_CONFIG[ev.eventType] || {
            badge: "glass-card-subtle text-slate-600 dark:text-slate-300",
            dot: "bg-slate-400",
            icon: <HiOutlineClock className="w-4 h-4 text-slate-400" />,
            label: ev.eventType,
          };

          return (
            <div key={ev.id || idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1.5 flex items-center justify-center">
                <span className={`w-3.5 h-3.5 rounded-full ${cfg.dot} shadow-sm ring-4 ring-white dark:ring-[#080d1a]`} />
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-xl glass-card-subtle border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {cfg.icon}
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {cfg.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {formatDate(ev.timestamp)}
                  </span>
                </div>

                {ev.note && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 leading-relaxed bg-slate-100/70 dark:bg-black/20 p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                    {ev.note}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
                  {ev.actorAddress && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 dark:text-slate-500">Actor:</span>
                      <span className="text-indigo-700 dark:text-cyan-300 bg-indigo-50 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        {ev.actorAddress.length > 20
                          ? `${ev.actorAddress.slice(0, 10)}...${ev.actorAddress.slice(-8)}`
                          : ev.actorAddress}
                      </span>
                    </div>
                  )}

                  {ev.txHash && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 dark:text-slate-500">TX:</span>
                      <span className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {ev.txHash.length > 20
                          ? `${ev.txHash.slice(0, 10)}...${ev.txHash.slice(-8)}`
                          : ev.txHash}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
