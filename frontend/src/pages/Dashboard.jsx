import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EscrowCard from "../components/EscrowCard";
import Loader from "../components/Loader";
import api from "../services/api";

function Dashboard() {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      const response = await api.get("/api/escrows");
      setEscrows(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load escrows.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading escrows..." />;
  }

  if (error) {
    return (
      <div className="p-10 text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">

      {/* Header */}

      <div className="flex justify-between items-center mb-10">

        <div>
          <h1 className="text-4xl font-bold text-sky-400">
            Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Manage all your escrow contracts securely.
          </p>
        </div>

        <Link
          to="/create"
          className="bg-sky-500 hover:bg-sky-600 px-5 py-3 rounded-xl font-semibold transition"
        >
          + Create Escrow
        </Link>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-800 rounded-xl p-6 shadow">
          <p className="text-slate-400">Total Escrows</p>
          <h2 className="text-4xl font-bold mt-2">
            {escrows.length}
          </h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 shadow">
          <p className="text-slate-400">Active</p>
          <h2 className="text-4xl font-bold text-blue-400 mt-2">
            {escrows.filter(e => e.status === "ACTIVE").length}
          </h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 shadow">
          <p className="text-slate-400">Released</p>
          <h2 className="text-4xl font-bold text-green-400 mt-2">
            {escrows.filter(e => e.status === "RELEASED").length}
          </h2>
        </div>

      </div>

      {/* Escrows */}

      {escrows.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center">

          <h2 className="text-2xl font-semibold">
            No Escrows Yet
          </h2>

          <p className="text-slate-400 mt-3">
            Create your first escrow to begin.
          </p>

        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {escrows.map((escrow) => (
            <EscrowCard
              key={escrow.id}
              escrow={escrow}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default Dashboard;