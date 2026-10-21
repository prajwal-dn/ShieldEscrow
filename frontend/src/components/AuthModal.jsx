import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, login, register, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMode === "register") {
        const newUser = await register(email, password, name);
        setSuccessInfo(newUser);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAuthModalOpen(false);
    setSuccessInfo(null);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 15, 30, 0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          padding: "32px",
          color: "#f8fafc",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: "22px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        {successInfo ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎉</div>
              <h3 style={{ fontSize: "22px", margin: "0 0 6px 0", color: "#38bdf8" }}>
                Account Successfully Created!
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
                Your standardized identity credentials for ShieldEscrow:
              </p>
            </div>

            <div
              style={{
                background: "#1e293b",
                borderRadius: "12px",
                padding: "18px",
                marginBottom: "24px",
                border: "1px solid #334155",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>
                  STANDARD USER ID
                </span>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", fontFamily: "monospace" }}>
                  {successInfo.userId}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px", borderTop: "1px solid #334155", paddingTop: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#38bdf8", display: "block", fontWeight: "600" }}>
                    BUYER ID
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "600", fontFamily: "monospace", color: "#cbd5e1" }}>
                    {successInfo.buyerId}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#a855f7", display: "block", fontWeight: "600" }}>
                    SELLER ID
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "600", fontFamily: "monospace", color: "#cbd5e1" }}>
                    {successInfo.sellerId}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "12px", borderTop: "1px solid #334155", paddingTop: "12px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>
                  REGISTERED EMAIL
                </span>
                <span style={{ fontSize: "14px", color: "#e2e8f0" }}>{successInfo.email}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #0284c7, #2563eb)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Continue to ShieldEscrow
            </button>
          </div>
        ) : (
          <div>
            {/* Header Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setError(""); }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: authMode === "login" ? "700" : "500",
                  color: authMode === "login" ? "#38bdf8" : "#94a3b8",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderBottom: authMode === "login" ? "2px solid #38bdf8" : "none",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setError(""); }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: authMode === "register" ? "700" : "500",
                  color: authMode === "register" ? "#38bdf8" : "#94a3b8",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderBottom: authMode === "register" ? "2px solid #38bdf8" : "none",
                }}
              >
                Create Account
              </button>
            </div>

            <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "-12px", marginBottom: "20px" }}>
              {authMode === "register"
                ? "Sign up with your Gmail to obtain your standardized User, Buyer, and Seller IDs."
                : "Enter your Gmail ID or User ID (e.g. USR-XXXXXX) and password to access the platform."}
            </p>

            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#fca5a5",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {authMode === "register" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#cbd5e1", marginBottom: "6px" }}>
                    Full Name / Organization
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alice Crypto or Acme Corp"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#cbd5e1", marginBottom: "6px" }}>
                  {authMode === "register" ? "Gmail Address" : "Gmail or User ID"}
                </label>
                <input
                  type={authMode === "register" ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={authMode === "register" ? "yourname@gmail.com" : "yourname@gmail.com or USR-123456"}
                  required
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#cbd5e1", marginBottom: "6px" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: loading
                    ? "#334155"
                    : "linear-gradient(135deg, #0284c7, #2563eb)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                }}
              >
                {loading
                  ? "Processing..."
                  : authMode === "register"
                  ? "Create Standardized Account"
                  : "Sign In"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "#94a3b8" }}>
              {authMode === "register" ? (
                <>
                  Already registered?{" "}
                  <span
                    onClick={() => { setAuthMode("login"); setError(""); }}
                    style={{ color: "#38bdf8", cursor: "pointer", fontWeight: "600" }}
                  >
                    Sign In
                  </span>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <span
                    onClick={() => { setAuthMode("register"); setError(""); }}
                    style={{ color: "#38bdf8", cursor: "pointer", fontWeight: "600" }}
                  >
                    Create Account via Gmail
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
