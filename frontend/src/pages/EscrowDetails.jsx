import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import TransactionStatus from "../components/TransactionStatus";
import { useWallet } from "../context/WalletContext";
import api from "../services/api";
import { signTransaction } from "../services/escrowService";

function EscrowDetails() {
  const { id } = useParams();

  const { connected } = useWallet();

console.log("Wallet connected:", connected);

  const [escrow, setEscrow] = useState(null);
  const [transactionState, setTransactionState] = useState("idle");
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        const response = await api.get(`/api/escrows/${id}`);
        setEscrow(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load escrow.");
      } finally {
        setLoading(false);
      }
    };

    fetchEscrow();
  }, [id]);

  const handleReleaseFunds = async () => {
    if (!connected) {
      alert("Please connect your Midnight wallet first.");
      return;
    }

    try {
      setTransactionState("waiting-signature");

      // Wallet popup
      await signTransaction();

      setTransactionState("submitting");

      await api.post(`/api/escrows/${id}/approve`);

      const result = {
        txHash: "0x" + Date.now().toString(16),
      };

      setTransactionHash(result.txHash);

      setEscrow({
        ...escrow,
        status: "RELEASED",
      });

      setTransactionState("success");
    } catch (err) {
      console.error(err);
      setTransactionState("error");
    }
  };

  if (loading) {
    return <Loader message="Loading Escrow..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-sky-400">
          Escrow Details
        </h1>

        <p className="text-slate-400 mt-2">
          View and manage this escrow contract securely.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-3xl bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <h2 className="text-3xl font-bold mb-8">
          {escrow.description}
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-slate-400 text-sm mb-1">
              Buyer Wallet
            </p>

            <p className="break-all">
              {escrow.buyerAddress}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">
              Seller Wallet
            </p>

            <p className="break-all">
              {escrow.sellerAddress}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">
              Amount
            </p>

            <p className="text-2xl font-bold text-green-400">
              {escrow.amount}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">
              Status
            </p>

            <StatusBadge status={escrow.status} />
          </div>

          <div className="md:col-span-2">
            <p className="text-slate-400 text-sm mb-1">
              Created At
            </p>

            <p>{escrow.createdAt}</p>
          </div>
        </div>

        <hr className="border-slate-700 my-8" />

        {!connected && (
          <div className="mb-5 rounded-xl border border-yellow-500 bg-yellow-500/10 p-4 text-yellow-300">
            🔒 Connect your Midnight wallet to release funds.
          </div>
        )}

        <button
          onClick={handleReleaseFunds}
          disabled={
            !connected ||
            transactionState === "waiting-signature" ||
            transactionState === "submitting" ||
            escrow.status === "RELEASED"
          }
          className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
            connected
              ? "bg-sky-500 hover:bg-sky-600"
              : "bg-slate-600 cursor-not-allowed"
          }`}
        >
          {escrow.status === "RELEASED"
            ? "Funds Released ✅"
            : !connected
            ? "Connect Wallet to Continue"
            : transactionState === "waiting-signature"
            ? "Waiting for Wallet Signature..."
            : transactionState === "submitting"
            ? "Submitting Transaction..."
            : "Release Funds"}
        </button>

        <div className="mt-8">
          <TransactionStatus
            state={transactionState}
            hash={transactionHash}
          />
        </div>
      </div>
    </div>
  );
}

export default EscrowDetails;