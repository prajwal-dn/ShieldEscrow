/**
 * Phase 3 — NotificationToast
 *
 * Renders a stack of push notifications received over WebSocket.
 * Toasts auto-dismiss after 5 seconds with a smooth slide-in animation.
 *
 * Usage:
 *   import NotificationToast from "./NotificationToast";
 *   <NotificationToast notification={lastNotification} />
 *
 * Props:
 *   notification – EscrowNotification object (or null); a new object triggers a new toast
 */
import { useEffect, useState, useRef } from "react";

const EVENT_META = {
  CREATED:   { icon: "🆕", color: "#38bdf8", label: "Escrow Created" },
  FUNDED:    { icon: "💰", color: "#22c55e", label: "Escrow Funded" },
  COMPLETED: { icon: "✅", color: "#a78bfa", label: "Work Completed" },
  RELEASED:  { icon: "🚀", color: "#34d399", label: "Funds Released" },
  DISPUTED:  { icon: "⚠️", color: "#f87171", label: "Dispute Raised" },
  SYNCED:    { icon: "⛓️", color: "#fb923c", label: "On-Chain Synced" },
};

let toastIdCounter = 0;

export default function NotificationToast({ notification }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  // Add a new toast every time the notification object changes
  useEffect(() => {
    if (!notification) return;
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { ...notification, _toastId: id }]);

    // Auto-dismiss after 5 s — timer is stored in ref, not the cleanup
    timersRef.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t._toastId !== id));
      delete timersRef.current[id];
    }, 5000);

    // Cleanup only this toast's timer on unmount, not on re-render
    return () => {
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    };
  }, [notification]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column-reverse",
        gap: "12px",
        zIndex: 99999,
        maxWidth: "340px",
      }}
    >
      {toasts.map((toast) => {
        const meta = EVENT_META[toast.eventType] || {
          icon: "📋",
          color: "#94a3b8",
          label: toast.eventType,
        };
        return (
          <div
            key={toast._toastId}
            style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              border: `1px solid ${meta.color}55`,
              borderLeft: `4px solid ${meta.color}`,
              borderRadius: "14px",
              padding: "14px 18px",
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${meta.color}22`,
              animation: "slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              cursor: "pointer",
            }}
            onClick={() =>
              setToasts((prev) =>
                prev.filter((t) => t._toastId !== toast._toastId)
              )
            }
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{meta.icon}</span>
              <span
                style={{
                  color: meta.color,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {meta.label}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  color: "#475569",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </span>
            </div>

            {/* Note */}
            {toast.note && (
              <p
                style={{
                  color: "#cbd5e1",
                  fontSize: "0.82rem",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {toast.note}
              </p>
            )}

            {/* Escrow ID */}
            <p
              style={{
                color: "#475569",
                fontSize: "0.75rem",
                margin: "4px 0 0",
                fontFamily: "monospace",
              }}
            >
              Escrow #{toast.escrowId}
            </p>
          </div>
        );
      })}

      {/* Keyframe injection */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
