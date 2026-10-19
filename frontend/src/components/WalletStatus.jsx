import { useWallet } from "../context/WalletContext";

function WalletStatus() {
  const { connected, address, initiateConnect, disconnect } = useWallet();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {connected ? (
        <>
          <span style={{ color: "#22c55e", fontWeight: "bold" }}>
            🟢 Connected
          </span>
          <span style={{ color: "white", fontSize: "0.85rem" }}>
            {address.length > 18 ? address.substring(0, 18) + "…" : address}
          </span>
          <button
            id="btn-disconnect-wallet"
            onClick={disconnect}
            style={{
              background: "transparent",
              border: "1px solid #ef4444",
              color: "#ef4444",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          id="btn-connect-wallet"
          onClick={initiateConnect}
          style={{
            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
            color: "#0f172a",
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "0.9rem",
            boxShadow: "0 4px 15px rgba(56,189,248,0.3)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletStatus;