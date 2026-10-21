import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { submitTransaction } from "../services/escrowService";
import { useNavigate } from "react-router-dom";

function CreateEscrow() {
  const { address: walletAddress, connected, initiateConnect } = useWallet();
  const { user, isAuthenticated, openRegister, generateStandardId } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    buyerAddress: "",
    sellerAddress: "",
    amount: "",
    description: "",
    inspectionWindow: "72 Hours",
    inspectionCriteria: "1. Complete code or item delivery matching written specifications.\n2. Zero critical defects or blocking bugs upon buyer testing.\n3. Source files or verified tracking proof provided.\n4. 72-hour buyer inspection window prior to automated settlement.",
    proofOfDelivery: "Repository commit tag, delivery tracking number, or verifiable digital handover confirmation.",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.buyerId) {
      setFormData((prev) => ({
        ...prev,
        buyerAddress: user.buyerId,
      }));
    } else if (connected && walletAddress && !formData.buyerAddress) {
      setFormData((prev) => ({
        ...prev,
        buyerAddress: walletAddress,
      }));
    }
  }, [isAuthenticated, user, connected, walletAddress]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerateSellerId = () => {
    const generated = generateStandardId("SEL");
    setFormData((prev) => ({ ...prev, sellerAddress: generated }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.buyerAddress.trim()) {
      newErrors.buyerAddress = "Standardized Buyer ID or wallet is required";
    }

    if (!formData.sellerAddress.trim()) {
      newErrors.sellerAddress = "Standardized Seller ID or wallet is required";
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Escrow amount must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product or agreement description is required";
    }

    if (!formData.inspectionCriteria.trim()) {
      newErrors.inspectionCriteria = "Acceptance and inspection criteria are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Execute on-chain funding transaction
      const txResult = await submitTransaction(null, "create");
      const txHash = txResult.txHash;

      const payload = {
        ...formData,
        txHash,
      };

      const response = await api.post("/api/escrows", payload);

      alert(`✅ Escrow Created & Secured On-Chain!\n\nBuyer: ${formData.buyerAddress}\nSeller: ${formData.sellerAddress}\nTransaction ID: ${txHash}`);

      if (response.data?.id) {
        navigate(`/escrow/${response.data.id}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create escrow: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Page Heading */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#f8fafc", margin: "0 0 8px 0" }}>
          Create Decentralized Escrow
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
          Define standardized identities, locked escrow capital, and strict product inspection criteria.
        </p>
      </div>

      {/* Account Verification Banner */}
      {!isAuthenticated && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(2,132,199,0.15), rgba(37,99,235,0.15))",
            border: "1px solid rgba(56,189,248,0.4)",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontWeight: "700", color: "#38bdf8", fontSize: "15px" }}>
              💡 Standardized Account Recommended
            </div>
            <div style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "2px" }}>
              Register your Gmail to get verified User, Buyer, and Seller IDs for transaction non-repudiation.
            </div>
          </div>
          <button
            type="button"
            onClick={openRegister}
            style={{
              background: "#38bdf8",
              color: "#0f172a",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Register with Gmail
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <div
        style={{
          background: "#0f172a",
          borderRadius: "18px",
          border: "1px solid #1e293b",
          padding: "32px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          color: "#f8fafc",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* SECTION 1: Standardized Identities */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#38bdf8", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              1. Standardized Counterparty Identities
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              {/* Buyer */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>
                  Buyer Identifier (Buyer ID or Wallet)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="buyerAddress"
                    value={formData.buyerAddress}
                    onChange={handleChange}
                    placeholder="e.g. BUY-849204 or wallet address"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      color: "white",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
                {user?.buyerId && (
                  <span style={{ fontSize: "11px", color: "#34d399", marginTop: "4px", display: "block" }}>
                    ✓ Linked to your account ({user.buyerId})
                  </span>
                )}
                {errors.buyerAddress && (
                  <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>{errors.buyerAddress}</p>
                )}
              </div>

              {/* Seller */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#cbd5e1" }}>
                    Seller Identifier
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSellerId}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#a855f7",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    + Generate Standard ID
                  </button>
                </div>
                <input
                  type="text"
                  name="sellerAddress"
                  value={formData.sellerAddress}
                  onChange={handleChange}
                  placeholder="e.g. SEL-391048 or wallet address"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                  }}
                />
                {errors.sellerAddress && (
                  <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>{errors.sellerAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Financial Escrow Terms */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#38bdf8", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              2. Financial Terms & Agreement
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>
                  Escrow Amount (ADA / tNight)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. 250"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
                {errors.amount && (
                  <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>{errors.amount}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>
                  Inspection Window (Review Duration)
                </label>
                <select
                  name="inspectionWindow"
                  value={formData.inspectionWindow}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="24 Hours">24 Hours (Express Deliverables)</option>
                  <option value="48 Hours">48 Hours</option>
                  <option value="72 Hours">72 Hours (Standard Commercial)</option>
                  <option value="7 Days">7 Days (Complex Software / Goods)</option>
                  <option value="14 Days">14 Days (Extended Physical Inspection)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>
                Deliverable Overview & Description
              </label>
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief summary of the agreement, service scope, or physical product..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              {errors.description && (
                <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>{errors.description}</p>
              )}
            </div>
          </div>

          {/* SECTION 3: Inspection & Acceptance Judging Criteria */}
          <div style={{ marginBottom: "32px", borderTop: "1px solid #1e293b", paddingTop: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#38bdf8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              3. Product Inspection & Acceptance Criteria ⚖️
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 16px 0" }}>
              Clearly specify the standards by which the deliverable is judged and verified before funds are released.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>
                Quality Standards & Judging Checklist
              </label>
              <textarea
                rows="4"
                name="inspectionCriteria"
                value={formData.inspectionCriteria}
                onChange={handleChange}
                placeholder="Enumerate the required acceptance benchmarks (e.g. 100% test coverage, zero physical damage, matching serial numbers)..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "sans-serif",
                  lineHeight: "1.5",
                }}
              />
              {errors.inspectionCriteria && (
                <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>{errors.inspectionCriteria}</p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>
                Mandatory Proof of Delivery / Handover
              </label>
              <input
                type="text"
                name="proofOfDelivery"
                value={formData.proofOfDelivery}
                onChange={handleChange}
                placeholder="e.g. Courier tracking code, verified commit SHA, or signed bill of lading"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading
                ? "#334155"
                : "linear-gradient(135deg, #0284c7, #2563eb)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontWeight: "700",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 15px -3px rgba(2, 132, 199, 0.4)",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Locking Funds & Deploying Escrow..." : "Create & Secure Escrow Agreement"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEscrow;