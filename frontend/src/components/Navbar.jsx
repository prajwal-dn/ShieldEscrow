import { Link } from "react-router-dom";
import WalletStatus from "./WalletStatus";

function Navbar() {
  return (
    <nav
      style={{
        background: "#0f172a",
        borderBottom: "1px solid #1e293b",
        padding: "16px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left */}
      <div style={{ minWidth: "180px" }}>
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
              fontSize: "30px",
            }}
          >
            TrustPay
          </h2>
        </Link>
      </div>

      {/* Center */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <Link
          to="/"
          style={{ color: "white", textDecoration: "none" }}
        >
          Home
        </Link>

        <Link
          to="/dashboard"
          style={{ color: "white", textDecoration: "none" }}
        >
          Dashboard
        </Link>

        <Link
          to="/create"
          style={{ color: "white", textDecoration: "none" }}
        >
          Create Escrow
        </Link>
      </div>

      {/* Right */}
      <div
        style={{
          minWidth: "220px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <WalletStatus />
      </div>
    </nav>
  );
}

export default Navbar;