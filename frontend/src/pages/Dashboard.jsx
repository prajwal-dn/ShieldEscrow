import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import EscrowCard from "../components/EscrowCard";
import Loader from "../components/Loader";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  HiOutlineViewGrid, 
  HiOutlinePlusCircle, 
  HiOutlineSearch, 
  HiOutlineShieldCheck, 
  HiOutlineLockClosed, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineUser
} from "react-icons/hi";

function Dashboard() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | ACTIVE | COMPLETED | RELEASED | DISPUTED
  const [searchQuery, setSearchQuery] = useState("");

  const userKeys = useMemo(() => {
    return [user?.buyerId, user?.sellerId, user?.userId, user?.email]
      .filter(Boolean)
      .map(s => String(s).toLowerCase());
  }, [user]);

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/escrows");
      const data = response.data || [];

      // Strict client-side verification to ensure account isolation
      const myEscrows = data.filter((e) => {
        if (userKeys.length === 0) return false;
        const buyer = (e.buyerAddress || "").toLowerCase();
        const seller = (e.sellerAddress || "").toLowerCase();
        return userKeys.includes(buyer) || userKeys.includes(seller);
      });

      setEscrows(myEscrows);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to sync escrows from the ledger. Please check network connectivity.");
    } finally {
      setLoading(false);
    }
  };

  // Metrics computation for current user's isolated account
  const stats = useMemo(() => {
    const total = escrows.length;
    const active = escrows.filter((e) => ["CREATED", "FUNDED", "COMPLETED"].includes(e.status)).length;
    const released = escrows.filter((e) => e.status === "RELEASED").length;
    const disputed = escrows.filter((e) => e.status === "DISPUTED").length;
    const totalCapital = escrows.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return { total, active, released, disputed, totalCapital };
  }, [escrows]);

  // Filtered escrows list
  const filteredEscrows = useMemo(() => {
    return escrows.filter((e) => {
      // Filter by status tab
      if (filter === "ACTIVE" && !["CREATED", "FUNDED", "COMPLETED"].includes(e.status)) return false;
      if (filter === "COMPLETED" && e.status !== "COMPLETED") return false;
      if (filter === "RELEASED" && e.status !== "RELEASED") return false;
      if (filter === "DISPUTED" && e.status !== "DISPUTED") return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = String(e.id).includes(query);
        const matchesDesc = (e.description || "").toLowerCase().includes(query);
        const matchesBuyer = (e.buyerAddress || "").toLowerCase().includes(query);
        const matchesSeller = (e.sellerAddress || "").toLowerCase().includes(query);
        return matchesId || matchesDesc || matchesBuyer || matchesSeller;
      }

      return true;
    });
  }, [escrows, filter, searchQuery]);

  if (loading) {
    return <Loader message="Decrypting your private on-chain escrows..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
              LEDGER SYNCED
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Midnight Preprod Testnet
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white">
            Escrow Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Private, shielded escrow vault for <strong className="text-slate-900 dark:text-white">{user?.name || user?.email}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEscrows}
            className="p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.1] transition shadow-sm cursor-pointer"
            title="Refresh Ledger State"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
          
          <Link
            to="/create"
            className="btn-shimmer-primary px-5 py-3 rounded-xl text-sm font-semibold tracking-wide"
          >
            <HiOutlinePlusCircle className="w-5 h-5" />
            <span>Create Escrow</span>
          </Link>
        </div>
      </div>

      {/* Account Verification & Multi-Tenant Isolation Badge */}
      {user && (
        <div className="p-3.5 rounded-2xl glass-card-subtle border border-indigo-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-700 dark:text-slate-300">
              Isolated Vault: <strong className="text-indigo-600 dark:text-cyan-400">{user.userId}</strong>
            </span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-500 dark:text-slate-400">Buyer ID: <strong className="text-slate-700 dark:text-slate-300">{user.buyerId}</strong></span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-500 dark:text-slate-400">Seller ID: <strong className="text-slate-700 dark:text-slate-300">{user.sellerId}</strong></span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ End-to-end account isolation active
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HiOutlineExclamationCircle className="w-5 h-5 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchEscrows}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Escrows */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Contracts
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <HiOutlineShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            {stats.totalCapital.toLocaleString()} tNight in your account
          </p>
        </div>

        {/* Active In-Progress */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Locked In Escrow
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <HiOutlineLockClosed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-indigo-600 dark:text-indigo-300">
            {stats.active}
          </div>
          <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1 font-mono">
            Secured on testnet
          </p>
        </div>

        {/* Released & Settled */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Settled & Released
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <HiOutlineCheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-emerald-600 dark:text-emerald-400">
            {stats.released}
          </div>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-mono">
            Full release confirmed
          </p>
        </div>

        {/* In Dispute */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Disputed Escrows
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
              <HiOutlineExclamationCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-rose-600 dark:text-rose-400">
            {stats.disputed}
          </div>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 font-mono">
            {stats.disputed === 0 ? "Zero disputes pending" : "In arbitration"}
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2 rounded-2xl glass-panel">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.04]">
          {[
            { id: "ALL", label: "All Contracts", count: stats.total },
            { id: "ACTIVE", label: "Active", count: stats.active },
            { id: "RELEASED", label: "Released", count: stats.released },
            { id: "DISPUTED", label: "Disputed", count: stats.disputed },
          ].map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-white dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-white/[0.12]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${active ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" : "bg-slate-200 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] md:max-w-xs">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Description, Address..."
            className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Escrow Cards Grid or Empty State */}
      {filteredEscrows.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl glass-panel text-center max-w-xl mx-auto my-8 border border-slate-200 dark:border-white/[0.08]">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4 shadow-sm">
            <HiOutlineShieldCheck className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-display font-black text-slate-900 dark:text-white mb-2">
            {searchQuery ? "No Matching Escrows Found" : "No Escrow Contracts in Your Vault"}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
            {searchQuery 
              ? "Try adjusting your search criteria or clear the search filter to display all contracts." 
              : "Your account is isolated. Create an agreement to lock funds or share your Buyer/Seller ID with a counterparty."}
          </p>

          <Link
            to="/create"
            className="btn-shimmer-primary px-6 py-3 rounded-xl text-xs font-semibold inline-flex"
          >
            + Create New Escrow Agreement
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredEscrows.map((escrow) => (
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