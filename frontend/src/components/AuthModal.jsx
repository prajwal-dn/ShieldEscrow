import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  HiOutlineX, 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineUser, 
  HiOutlineCheck,
  HiOutlineClipboardCopy,
  HiOutlineSparkles,
  HiOutlineAtSymbol
} from "react-icons/hi";

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, login, register } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (authMode === "register") {
        // Enforce strict email address validation
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
        if (!cleanEmail || !emailPattern.test(cleanEmail)) {
          setError("Please enter a valid email address (e.g., name@example.com).");
          setLoading(false);
          return;
        }

        const newUser = await register(cleanEmail, password, name, username);
        setSuccessInfo(newUser);
      } else {
        await login(email.trim(), password);
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
    setUsername("");
    setPassword("");
    setName("");
  };

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/90 dark:border-cyan-500/20 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          aria-label="Close"
        >
          <HiOutlineX className="w-5 h-5" />
        </button>

        {successInfo ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-900 dark:bg-[#080d1a] rounded-2xl flex items-center justify-center">
                  <HiOutlineSparkles className="w-7 h-7 text-indigo-400 dark:text-cyan-400" />
                </div>
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                Account Verified & Activated
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Your standardized identity credentials for trustless settlement:
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-card-subtle border border-slate-200/80 dark:border-white/[0.08] space-y-3 mb-6">
              {/* Username Tag */}
              {successInfo.username && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/80 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04]">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Custom Username
                    </span>
                    <span className="text-sm font-mono font-bold text-indigo-600 dark:text-cyan-300">
                      @{successInfo.username}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy("handle", `@${successInfo.username}`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-300 transition cursor-pointer"
                    title="Copy Username"
                  >
                    {copiedKey === "handle" ? <HiOutlineCheck className="w-4 h-4 text-emerald-500" /> : <HiOutlineClipboardCopy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* User ID */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/80 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04]">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Standard User ID
                  </span>
                  <span className="text-sm font-mono font-bold text-indigo-600 dark:text-cyan-300">
                    {successInfo.userId}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy("user", successInfo.userId)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-300 transition cursor-pointer"
                  title="Copy User ID"
                >
                  {copiedKey === "user" ? <HiOutlineCheck className="w-4 h-4 text-emerald-500" /> : <HiOutlineClipboardCopy className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-cyan-400 uppercase tracking-wider block">
                      Buyer ID
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {successInfo.buyerId}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy("buyer", successInfo.buyerId)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-300 transition cursor-pointer"
                  >
                    {copiedKey === "buyer" ? <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" /> : <HiOutlineClipboardCopy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                      Seller ID
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {successInfo.sellerId}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy("seller", successInfo.sellerId)}
                    className="p-1 rounded text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition cursor-pointer"
                  >
                    {copiedKey === "seller" ? <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" /> : <HiOutlineClipboardCopy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-2 text-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Verified Email: <span className="text-slate-800 dark:text-slate-200 font-medium">{successInfo.email}</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="btn-shimmer-primary w-full py-3 rounded-xl text-sm font-semibold"
            >
              Enter ShieldEscrow Portal
            </button>
          </div>
        ) : (
          <div>
            {/* Tab switch */}
            <div className="flex p-1 rounded-2xl bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setError(""); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                  authMode === "login"
                    ? "bg-white dark:bg-indigo-500/30 text-indigo-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setError(""); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                  authMode === "register"
                    ? "bg-white dark:bg-indigo-500/30 text-indigo-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Register Account
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight">
                {authMode === "register" ? "Create Verified Escrow Identity" : "Welcome Back"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {authMode === "register"
                  ? "Register with a valid email address and create a custom username for trustless treaty coordination."
                  : "Sign in with your email address, custom username (@handle), or User ID."}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Specific Fields */}
              {authMode === "register" && (
                <>
                  {/* Custom Username Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Create Custom Username
                      </label>
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-cyan-400 font-semibold">
                        Unique Handle
                      </span>
                    </div>
                    <div className="relative">
                      <HiOutlineAtSymbol className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        placeholder="e.g. alex_vance or crypto_builder"
                        className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-mono">
                      Letters, numbers, underscores (3–24 chars)
                    </span>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name or Entity Name (Optional)
                    </label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Vance or Acme Corp"
                        className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {authMode === "register" ? "Email Address" : "Email, Username, or User ID"}
                  </label>
                  {authMode === "register" && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Valid email required
                    </span>
                  )}
                </div>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={authMode === "register" ? "email" : "text"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authMode === "register" ? "name@example.com" : "name@example.com, @username, or USR-123456"}
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-shimmer-primary w-full py-3 rounded-xl text-xs font-semibold mt-2 cursor-pointer"
              >
                {loading ? "Processing..." : authMode === "register" ? "Register Escrow Account" : "Sign In to Portal"}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/[0.06] text-center">
              {authMode === "register" ? (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Already have an escrow account?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("login"); setError(""); }}
                    className="text-indigo-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Need a verified escrow account?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("register"); setError(""); }}
                    className="text-indigo-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
                  >
                    Register Account
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
