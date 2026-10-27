import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { 
  HiShieldCheck, 
  HiOutlineLockClosed, 
  HiOutlineLightningBolt, 
  HiOutlineScale, 
  HiOutlineCubeTransparent, 
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineExternalLink,
  HiOutlineClipboardCheck,
  HiOutlineEyeOff,
  HiOutlineSparkles,
  HiOutlineLink,
  HiOutlineUserGroup
} from "react-icons/hi";

function Landing() {
  const { isAuthenticated, openLogin, openRegister } = useAuth();
  const navigate = useNavigate();

  // Interactive State Machine Simulator
  const [simState, setSimState] = useState("FUNDED"); // FUNDED -> COMPLETED -> RELEASED
  const [simTx, setSimTx] = useState("sim_tx_8f2c...4e19");

  const handleSimulateStep = (nextState) => {
    setSimState(nextState);
    setSimTx("sim_tx_" + Math.random().toString(16).slice(2, 8) + "..." + Math.random().toString(16).slice(2, 6));
  };

  const handleActionPrimary = () => {
    if (isAuthenticated) {
      navigate("/create");
    } else {
      openRegister();
    }
  };

  const handleActionSecondary = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      openLogin();
    }
  };

  return (
    <div className="min-h-screen ambient-bg bg-grid-pattern text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-200 transition-colors duration-200">
      
      {/* ── Global Unified Navbar ── */}
      <Navbar />

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Subtle Architectural Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Pill Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card-subtle border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-semibold tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-cyan-400 animate-ping"></span>
                <span>ZERO-KNOWLEDGE ESCROW PROTOCOL</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></span>
                PREPROD TESTNET
              </span>
            </div>

            {/* Display Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.08] mb-6 text-slate-900 dark:text-white">
              Trustless Settlement. <br />
              <span className="gradient-text-vivid">
                Zero Counterparty Risk.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300/90 leading-relaxed max-w-2xl mx-auto mb-10 font-normal">
              Eliminate middleman fees, payment delays, and custody disputes. 
              Capital is cryptographically locked in <strong className="text-slate-900 dark:text-white font-semibold">Midnight smart contracts</strong> and released only when deliverables satisfy strict inspection criteria.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button
                onClick={handleActionPrimary}
                className="btn-shimmer-primary w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold tracking-wide shadow-xl shadow-indigo-600/20 cursor-pointer"
              >
                <span>{isAuthenticated ? "Initialize Escrow Agreement" : "Register to Create Escrow"}</span>
                <HiOutlineArrowRight className="w-5 h-5 ml-1" />
              </button>

              <button
                onClick={handleActionSecondary}
                className="btn-glass-secondary w-full sm:w-auto px-7 py-4 rounded-2xl text-sm font-semibold cursor-pointer"
              >
                {isAuthenticated ? "Explore Active Contracts" : "Sign In to Access Dashboard"}
              </button>
            </div>

            {!isAuthenticated && (
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-10">
                🔒 Private multi-tenant access: sign in to unlock your personal verified contracts.
              </p>
            )}

            {/* Honest Stats Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 pt-6 border-t border-slate-200/80 dark:border-white/[0.08] text-left">
              <div className="p-4 rounded-2xl glass-card-subtle">
                <span className="text-2xl sm:text-3xl font-display font-black text-indigo-600 dark:text-indigo-400">
                  100%
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Non-Custodial Lock</p>
              </div>

              <div className="p-4 rounded-2xl glass-card-subtle">
                <span className="text-2xl sm:text-3xl font-display font-black text-emerald-600 dark:text-emerald-400">
                  0%
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Platform Fee</p>
              </div>

              <div className="p-4 rounded-2xl glass-card-subtle">
                <span className="text-2xl sm:text-3xl font-display font-black text-indigo-600 dark:text-purple-400">
                  ZK-SNARK
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Private State Proofs</p>
              </div>

              <div className="p-4 rounded-2xl glass-card-subtle">
                <span className="text-2xl sm:text-3xl font-display font-black text-amber-600 dark:text-amber-400">
                  &lt; 2s
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Settlement Finality</p>
              </div>
            </div>

          </div>

          {/* ── Interactive Live Escrow Simulator Card ─────────────────── */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="p-1 rounded-3xl bg-gradient-to-b from-indigo-500/20 via-cyan-500/10 to-transparent shadow-xl">
              <div className="glass-panel p-6 sm:p-8 rounded-[22px] text-left relative overflow-hidden">
                
                {/* Simulator header bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-2">
                      LIVE CONTRACT SIMULATOR
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-cyan-400">
                      State Machine:
                    </span>
                    <StatusBadge status={simState} size="sm" />
                  </div>
                </div>

                {/* Contract Spec */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.06]">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mb-1">
                      AGREEMENT DESCRIPTION
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Full-Stack Web3 DApp Development & ZK Audit
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mb-1">
                        LOCKED ESCROW CAPITAL
                      </span>
                      <p className="text-xl font-display font-extrabold text-indigo-600 dark:text-cyan-300">
                        25,000.00 <span className="text-xs font-mono text-slate-500 dark:text-slate-400">tNight</span>
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400">
                      <HiOutlineLockClosed className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-3 mb-6 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-slate-500 block mb-1">BUYER (DEPOSITOR):</span>
                    <span className="text-indigo-600 dark:text-cyan-300 font-medium">BUY-894210 (Verified)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-slate-500 block mb-1">SELLER (BENEFICIARY):</span>
                    <span className="text-purple-600 dark:text-purple-300 font-medium">SEL-513904 (Verified)</span>
                  </div>
                </div>

                {/* Simulated Interactive Triggers */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08]">
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
                    <span>⚡ Try State Machine Transitions:</span>
                    <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-semibold">Click step to simulate</span>
                  </p>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleSimulateStep("FUNDED")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition cursor-pointer ${
                        simState === "FUNDED"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-white/[0.04]"
                      }`}
                    >
                      1. Reset: Funded
                    </button>

                    <button
                      onClick={() => handleSimulateStep("COMPLETED")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition cursor-pointer ${
                        simState === "COMPLETED"
                          ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-white/[0.04]"
                      }`}
                    >
                      2. Seller Delivers Work
                    </button>

                    <button
                      onClick={() => handleSimulateStep("RELEASED")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition cursor-pointer ${
                        simState === "RELEASED"
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-white/[0.04]"
                      }`}
                    >
                      3. Buyer Approves & Releases
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Proof Hash: <span className="text-slate-700 dark:text-slate-200">{simTx}</span></span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <HiOutlineCheck className="w-3.5 h-3.5" /> ZK-Verified
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── How It Works / Website Usage ──────────────────────── */}
      <section className="py-20 border-t border-slate-200/80 dark:border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 block mb-2">
              SIMPLE 4-STEP WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-slate-900 dark:text-white">
              How to Use ShieldEscrow
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              Create an account, set rules together, submit work as a link, and let Gemini AI automatically release the funds on green signal.
            </p>
          </div>

          {/* 4 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              {
                step: "01",
                role: "Buyer & Seller",
                title: "Common Session",
                desc: "Both parties sign up and meet in a shared treaty room via a single invite link.",
                icon: <HiOutlineUserGroup className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />,
                tagBg: "bg-indigo-50 dark:bg-cyan-500/10 text-indigo-700 dark:text-cyan-300 border-indigo-200 dark:border-cyan-500/20",
              },
              {
                step: "02",
                role: "Buyer Action",
                title: "Lock Capital & Rules",
                desc: "Buyer deposits funds and defines clear acceptance criteria and quality rules.",
                icon: <HiOutlineLockClosed className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />,
                tagBg: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20",
              },
              {
                step: "03",
                role: "Seller Action",
                title: "Submit Product Link",
                desc: "When work is finished, the seller pastes their deliverable link (GitHub repo, live app, or file URL).",
                icon: <HiOutlineLink className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
                tagBg: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20",
              },
              {
                step: "04",
                role: "Gemini AI Engine",
                title: "Green Signal & Payout",
                desc: "AI inspects the link against all treaty rules. On green signal, funds are instantly released.",
                icon: <HiOutlineSparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
                tagBg: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="glass-panel p-6 rounded-3xl relative flex flex-col justify-between group hover:border-indigo-500/40 dark:hover:border-cyan-500/40 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-display font-black text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                      {item.step}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.tagBg}`}>
                        {item.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Side-by-Side Role Overview Banner */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-white/[0.08] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
              {/* Buyer Box */}
              <div className="flex-1 w-full p-5 rounded-2xl bg-indigo-50/60 dark:bg-white/[0.02] border border-indigo-200/60 dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-cyan-400" />
                  <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">For Buyers</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deposit funds safely into escrow and define strict criteria. Your money never leaves escrow until the product passes AI inspection.
                </p>
              </div>

              {/* Connecting Flow Indicator */}
              <div className="shrink-0 flex lg:flex-col items-center justify-center gap-1 text-slate-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                  AI Arbitrated
                </span>
                <HiOutlineArrowRight className="w-5 h-5 hidden lg:block" />
              </div>

              {/* Seller Box */}
              <div className="flex-1 w-full p-5 rounded-2xl bg-purple-50/60 dark:bg-white/[0.02] border border-purple-200/60 dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:text-purple-400" />
                  <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">For Sellers</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Build with confidence knowing the buyer's funds are already locked. Submit your work link, get the green signal, and receive instant payment.
                </p>
              </div>
            </div>

            {/* Bottom Live Action Strip */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 font-mono text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Integrated with Google Gemini 3.5 Flash for instant criteria evaluation</span>
              </div>
              <button
                onClick={handleActionPrimary}
                className="btn-shimmer-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>Try an Escrow Now</span>
                <HiOutlineArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── Feature Highlights ────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-200/80 dark:border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 block mb-2">
              ENGINEERED FOR ENTERPRISE COMMERCE
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-slate-900 dark:text-white">
              Built Beyond Conventional Escrow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <HiOutlineEyeOff className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />,
                title: "Zero-Knowledge Commercial Privacy",
                desc: "Powered by Midnight's Compact contracts. Deal terms and balances remain shielded while cryptographic validity is verified on-chain.",
              },
              {
                icon: <HiOutlineScale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
                title: "Multi-Party Dispute Arbitration",
                desc: "Integrated dispute resolution flow allows neutral arbiters to review inspection criteria and award full release or full refund.",
              },
              {
                icon: <HiOutlineLightningBolt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                title: "Zero Fee Intermediation",
                desc: "Unlike traditional escrow services charging 3% to 10%, ShieldEscrow smart contracts execute p2p settlement with zero rent-seeking.",
              },
              {
                icon: <HiOutlineClipboardCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
                title: "Cryptographic Audit Trail",
                desc: "Every status change generates an immutable log entry broadcasted live over WebSocket STOMP and recorded for non-repudiation.",
              },
              {
                icon: <HiShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
                title: "Standardized User & Entity IDs",
                desc: "Verified Gmail registration creates unique USR, BUY, and SEL identifiers so counterparty identity cannot be spoofed.",
              },
              {
                icon: <HiOutlineCubeTransparent className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
                title: "CIP-30 Universal Wallet Support",
                desc: "Auto-discovers Midnight Lace, Nightly, Eternl, and Nami browser extensions with dev-mode graceful failover.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass-panel p-8 rounded-3xl hover:border-indigo-500/35 dark:hover:border-cyan-500/35 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-white/[0.04] border border-indigo-100 dark:border-white/[0.08] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-300">
                  {f.icon}
                </div>

                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                  {f.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Comparison Section ────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-200/80 dark:border-white/[0.08] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white">
              ShieldEscrow vs Traditional Custody
            </h2>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-100/70 dark:bg-black/40">
                    <th className="p-4 sm:p-5 text-slate-600 dark:text-slate-400 font-semibold">FEATURE</th>
                    <th className="p-4 sm:p-5 text-indigo-600 dark:text-cyan-300 font-bold">SHIELDESCROW</th>
                    <th className="p-4 sm:p-5 text-slate-600 dark:text-slate-400 font-semibold">TRADITIONAL ESCROW</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
                  <tr>
                    <td className="p-4 sm:p-5 text-slate-800 dark:text-slate-300 font-sans font-semibold">Custody Model</td>
                    <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-semibold">100% Non-Custodial (Smart Contract)</td>
                    <td className="p-4 sm:p-5 text-rose-500 dark:text-rose-400">Centralized bank holding account</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-slate-800 dark:text-slate-300 font-sans font-semibold">Platform Fees</td>
                    <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-semibold">0% (Only minimal network gas)</td>
                    <td className="p-4 sm:p-5 text-rose-500 dark:text-rose-400">3.5% – 10% + Wire fees</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-slate-800 dark:text-slate-300 font-sans font-semibold">Payout Speed</td>
                    <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-semibold">Instant upon cryptographic approval</td>
                    <td className="p-4 sm:p-5 text-rose-500 dark:text-rose-400">3 to 7 business banking days</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-slate-800 dark:text-slate-300 font-sans font-semibold">Privacy Guarantee</td>
                    <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-semibold">Zero-Knowledge Proofs (Midnight)</td>
                    <td className="p-4 sm:p-5 text-rose-500 dark:text-rose-400">Opaque, unencrypted database</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Call To Action ─────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-200/80 dark:border-white/[0.08] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-tr from-indigo-50 via-white to-slate-50 dark:from-[#0d1326] dark:via-[#090e1a] dark:to-[#070b14] border border-indigo-200/80 dark:border-indigo-500/30 text-center relative overflow-hidden shadow-xl dark:shadow-2xl dark:shadow-indigo-950/50">
            
            <div className="absolute top-0 right-1/3 w-64 h-64 bg-indigo-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-display font-black text-slate-900 dark:text-white mb-4">
              Ready to Lock and Settle Securely?
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-8">
              Experience cryptographic certainty with zero custody risk. Create an escrow in 60 seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleActionPrimary}
                className="btn-shimmer-primary w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold tracking-wide shadow-xl shadow-indigo-600/20 cursor-pointer"
              >
                {isAuthenticated ? "Create Escrow Now" : "Register to Create Escrow"}
              </button>

              <button
                onClick={handleActionSecondary}
                className="btn-glass-secondary w-full sm:w-auto px-7 py-4 rounded-xl text-sm font-semibold cursor-pointer"
              >
                {isAuthenticated ? "Go to Dashboard" : "Sign In to Dashboard"}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="mt-auto py-10 border-t border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#04060b]/90 text-slate-500 dark:text-slate-400 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HiShieldCheck className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <span className="text-slate-900 dark:text-white font-bold font-display tracking-tight">ShieldEscrow</span>
            <span>— Midnight Privacy Protocol</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/prajwal-dn/ShieldEscrow"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 dark:hover:text-cyan-300 transition flex items-center gap-1"
            >
              GitHub Repository <HiOutlineExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://docs.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 dark:hover:text-cyan-300 transition flex items-center gap-1"
            >
              Midnight Docs <HiOutlineExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-slate-400 dark:text-slate-500">
            Open-Source MIT License • Preprod Testnet
          </p>
        </div>
      </footer>

    </div>
  );
}

export default Landing;