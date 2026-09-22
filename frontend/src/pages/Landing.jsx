
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 60px",
        }}
      >
        <h2 style={{ color: "#38bdf8" }}>TrustPay</h2>

        <div style={{ display: "flex", gap: "20px" }}>
          <Link
            to="/dashboard"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>

          <Link
            to="/create"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            Create Escrow
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          textAlign: "center",
          marginTop: "90px",
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "60px",
            marginBottom: "20px",
          }}
        >
          TrustPay
        </h1>

        <h2
          style={{
            color: "#38bdf8",
            marginBottom: "25px",
          }}
        >
          Privacy-First Escrow Powered by Midnight
        </h2>

        <p
          style={{
            fontSize: "20px",
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: "1.6",
            color: "#cbd5e1",
          }}
        >
          Secure payments between buyers and sellers using Midnight blockchain.
          Funds remain locked until both parties complete the agreement.
        </p>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <Link
            to="/dashboard"
            style={{
              background: "#38bdf8",
              color: "#0f172a",
              padding: "14px 28px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Get Started
          </Link>

          <Link
            to="/create"
            style={{
              border: "2px solid #38bdf8",
              color: "#38bdf8",
              padding: "14px 28px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Create Escrow
          </Link>
        </div>
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          marginTop: "100px",
          flexWrap: "wrap",
        }}
      >
        {[
          {
            icon: "🔒",
            title: "Secure Escrow",
            text: "Funds stay locked until buyer approves.",
          },
          {
            icon: "🛡",
            title: "Privacy",
            text: "Powered by Midnight's privacy-first blockchain.",
          },
          {
            icon: "⚡",
            title: "Instant Release",
            text: "Release funds securely with wallet approval.",
          },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              width: "280px",
              background: "#1e293b",
              padding: "30px",
              borderRadius: "15px",
              textAlign: "center",
            }}
          >
            <h1>{card.icon}</h1>

            <h3>{card.title}</h3>

            <p style={{ color: "#cbd5e1" }}>{card.text}</p>
          </div>
        ))}
      </div>

      {/* How it Works */}
      <div
        style={{
          marginTop: "120px",
          textAlign: "center",
          paddingBottom: "80px",
        }}
      >
        <h2 style={{ fontSize: "40px" }}>
          How It Works
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            marginTop: "50px",
            flexWrap: "wrap",
          }}
        >
          {[
            "Connect Wallet",
            "Create Escrow",
            "Seller Completes Work",
            "Release Funds",
          ].map((step, index) => (
            <div
              key={step}
              style={{
                width: "180px",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "#38bdf8",
                  color: "#0f172a",
                  margin: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {index + 1}
              </div>

              <h4
                style={{
                  marginTop: "20px",
                }}
              >
                {step}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Landing;