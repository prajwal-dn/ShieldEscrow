import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import useEscrowNotifications from "../hooks/useEscrowNotifications.js";

const EVENT_COLORS = {
  CREATED:   { dot: "#38bdf8", label: "Created",   icon: "🆕" },
  FUNDED:    { dot: "#22c55e", label: "Funded",    icon: "💰" },
  COMPLETED: { dot: "#a78bfa", label: "Completed", icon: "✅" },
  RELEASED:  { dot: "#34d399", label: "Released",  icon: "🚀" },
  DISPUTED:  { dot: "#f87171", label: "Disputed",  icon: "⚠️" },
};

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ActivityTimeline({ escrowId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Per-escrow WebSocket subscription — auto-refreshes on new events
  const { lastNotification } = useEscrowNotifications(escrowId);

  const fetchEvents = useCallback(() => {
    if (!escrowId) return;
    api.get(`/api/escrows/${escrowId}/events`)
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [escrowId]);

  // Initial load
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Live update — re-fetch whenever the backend pushes a notification
  useEffect(() => {
    if (!lastNotification) return;
    fetchEvents();
  }, [lastNotification, fetchEvents]);

  if (loading) {
    return (
      <div style={styles.wrap}>
        <h3 style={styles.heading}>Activity Log</h3>
        <p style={styles.empty}>Loading events…</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={styles.wrap}>
        <h3 style={styles.heading}>Activity Log</h3>
        <p style={styles.empty}>No events recorded yet.</p>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <h3 style={styles.heading}>Activity Log</h3>
      <div style={styles.timeline}>
        {events.map((ev, idx) => {
          const meta = EVENT_COLORS[ev.eventType] || {
            dot: "#94a3b8", label: ev.eventType, icon: "📋",
          };
          const isLast = idx === events.length - 1;
          return (
            <div key={ev.id} style={styles.row}>
              {/* Vertical connector */}
              <div style={styles.connectorCol}>
                <div style={{ ...styles.dot, background: meta.dot }} />
                {!isLast && <div style={styles.line} />}
              </div>

              {/* Content */}
              <div style={{ ...styles.card, borderColor: meta.dot + "40" }}>
                <div style={styles.cardHeader}>
                  <span style={{ fontSize: "1.1rem" }}>{meta.icon}</span>
                  <span style={{ ...styles.eventLabel, color: meta.dot }}>
                    {meta.label}
                  </span>
                  <span style={styles.timestamp}>
                    {formatDate(ev.timestamp)}
                  </span>
                </div>

                {ev.note && (
                  <p style={styles.note}>{ev.note}</p>
                )}

                {ev.actorAddress && (
                  <p style={styles.actor}>
                    By:{" "}
                    <span style={styles.actorVal}>
                      {ev.actorAddress.length > 24
                        ? ev.actorAddress.substring(0, 24) + "…"
                        : ev.actorAddress}
                    </span>
                  </p>
                )}

                {ev.txHash && (
                  <p style={styles.txHash}>
                    TX:{" "}
                    <span style={styles.txVal}>
                      {ev.txHash.substring(0, 28)}…
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    marginTop: "36px",
  },
  heading: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "20px",
  },
  empty: {
    color: "#475569",
    fontStyle: "italic",
    fontSize: "0.9rem",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    gap: "16px",
  },
  connectorCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "14px",
    flexShrink: 0,
    width: "16px",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    flexShrink: 0,
    boxShadow: "0 0 8px currentColor",
  },
  line: {
    width: 2,
    flex: 1,
    background: "rgba(148,163,184,0.2)",
    minHeight: "24px",
    marginTop: "4px",
    marginBottom: "4px",
  },
  card: {
    flex: 1,
    marginBottom: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: "12px",
    padding: "14px 16px",
    transition: "background 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "6px",
  },
  eventLabel: {
    fontWeight: 700,
    fontSize: "0.95rem",
    flex: 1,
  },
  timestamp: {
    color: "#475569",
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
  },
  note: {
    color: "#cbd5e1",
    fontSize: "0.88rem",
    marginBottom: "4px",
  },
  actor: {
    color: "#64748b",
    fontSize: "0.78rem",
    marginBottom: "2px",
  },
  actorVal: { color: "#94a3b8" },
  txHash: {
    color: "#64748b",
    fontSize: "0.78rem",
    fontFamily: "monospace",
  },
  txVal: { color: "#38bdf8" },
};
