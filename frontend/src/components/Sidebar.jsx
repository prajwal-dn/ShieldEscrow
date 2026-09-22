import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItem = (to, icon, label) => (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 18px",
        marginBottom: "12px",
        borderRadius: "12px",
        textDecoration: "none",
        color: location.pathname === to ? "#38bdf8" : "#e2e8f0",
        background:
          location.pathname === to
            ? "rgba(56,189,248,0.12)"
            : "transparent",
        fontWeight: location.pathname === to ? "600" : "500",
        transition: "0.3s",
      }}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#1e293b",
        borderRight: "1px solid #334155",
        padding: "30px 20px",
      }}
    >
      <h3
        style={{
          color: "#38bdf8",
          marginBottom: "30px",
          fontSize: "22px",
        }}
      >
        Navigation
      </h3>

      {menuItem("/dashboard", "🏠", "Dashboard")}

      {menuItem("/create", "➕", "Create Escrow")}
    </div>
  );
}

export default Sidebar;