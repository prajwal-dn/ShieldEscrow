import { useState } from "react";
import { listWallets } from "../wallet/selectWallet";

/**
 * WalletPickerModal — shown when multiple wallet extensions are detected.
 * The user clicks one card to choose which wallet to connect with.
 */
export default function WalletPickerModal({ onSelect, onClose }) {
  const wallets = listWallets();
  const [hover, setHover] = useState(null);

  if (wallets.length === 0) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={styles.title}>No Wallet Found</h2>
          <p style={styles.sub}>
            Install the{" "}
            <a
              href="https://midnight.network"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#38bdf8" }}
            >
              Midnight Lace wallet
            </a>{" "}
            or Midnight Nightly extension to continue.
          </p>
          <button style={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.title}>Connect Wallet</span>
          <button style={styles.xBtn} onClick={onClose} aria-label="close">
            ✕
          </button>
        </div>
        <p style={styles.sub}>
          {wallets.length} wallet{wallets.length > 1 ? "s" : ""} detected —
          choose one to connect.
        </p>

        {/* Wallet cards */}
        <div style={styles.list}>
          {wallets.map((w, i) => (
            <button
              key={w.key}
              id={`wallet-option-${w.key}`}
              style={{
                ...styles.card,
                ...(hover === i ? styles.cardHover : {}),
              }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(w)}
            >
              {w.icon ? (
                <img src={w.icon} alt={w.name} style={styles.icon} />
              ) : (
                <div style={styles.iconFallback}>
                  {w.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={styles.cardText}>
                <span style={styles.cardName}>{w.name}</span>
                <span style={styles.cardNet}>
                  {w.network === "midnight" ? "🌑 Midnight" : "₳ Cardano"}
                </span>
              </div>
              <span style={styles.arrow}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    background: "linear-gradient(145deg, #1e293b, #0f172a)",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: "20px",
    padding: "32px",
    width: "min(420px, 92vw)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  title: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#f1f5f9",
  },
  sub: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginBottom: "24px",
  },
  xBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "1.1rem",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "color 0.2s",
    lineHeight: 1,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    width: "100%",
  },
  cardHover: {
    background: "rgba(56,189,248,0.08)",
    borderColor: "rgba(56,189,248,0.4)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(56,189,248,0.1)",
  },
  icon: { width: 40, height: 40, borderRadius: "10px", objectFit: "cover" },
  iconFallback: {
    width: 40,
    height: 40,
    borderRadius: "10px",
    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: "1.2rem",
    flexShrink: 0,
  },
  cardText: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "2px",
  },
  cardName: { color: "#f1f5f9", fontWeight: 600, fontSize: "1rem" },
  cardNet: { color: "#64748b", fontSize: "0.8rem" },
  arrow: { color: "#38bdf8", fontSize: "1.2rem" },
  closeBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#94a3b8",
    cursor: "pointer",
    fontWeight: 600,
  },
};
