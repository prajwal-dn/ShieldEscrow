import { Link } from "react-router-dom";
import WalletStatus from "./WalletStatus";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout, openLogin, openRegister } = useAuth();

  return (
    <nav
      style={{
        background: "#0f172a",
        borderBottom: "1px solid #1e293b",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#38bdf8",
              fontSize: "26px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
            }}
          >
            🛡️ ShieldEscrow
          </h2>
        </Link>
      </div>

      {/* Center Links */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}
        >
          Home
        </Link>

        <Link
          to="/dashboard"
          style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}
        >
          Dashboard
        </Link>

        <Link
          to="/create"
          style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}
        >
          Create Escrow
        </Link>
      </div>

      {/* Right User & Wallet Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {isAuthenticated && user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#1e293b",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #334155",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#38bdf8", fontFamily: "monospace" }}>
                {user.userId}
              </div>
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                {user.email}
              </div>
            </div>

            <button
              onClick={logout}
              title="Log out of account"
              style={{
                background: "transparent",
                border: "1px solid #475569",
                borderRadius: "6px",
                padding: "3px 8px",
                color: "#f87171",
                fontSize: "11px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Exit
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={openLogin}
              style={{
                background: "transparent",
                border: "1px solid #334155",
                borderRadius: "6px",
                padding: "6px 14px",
                color: "#e2e8f0",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
            <button
              onClick={openRegister}
              style={{
                background: "linear-gradient(135deg, #0284c7, #2563eb)",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Register Gmail
            </button>
          </div>
        )}

        <WalletStatus />
      </div>
    </nav>
  );
}

export default Navbar;