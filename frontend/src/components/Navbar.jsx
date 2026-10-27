import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import WalletStatus from "./WalletStatus";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  HiShieldCheck, 
  HiOutlineViewGrid, 
  HiOutlinePlusCircle, 
  HiOutlineHome, 
  HiOutlineMenu, 
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineLockClosed
} from "react-icons/hi";

function Navbar() {
  const { user, isAuthenticated, logout, openLogin, openRegister } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-[#07090e]/80 border-b border-slate-200/80 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 p-[1px] shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-slate-900 dark:bg-[#0d121f] rounded-2xl flex items-center justify-center">
                  <HiShieldCheck className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-display font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                    Shield<span className="text-indigo-600 dark:text-indigo-400">Escrow</span>
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                    ZK PROTOCOL
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tracking-wider">
                  MIDNIGHT PREPROD
                </p>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links - Restricted by Auth */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] backdrop-blur-md">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                isActive("/")
                  ? "bg-white dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-white/[0.12]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]"
              }`}
            >
              <HiOutlineHome className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* Dashboard and Create Escrow visible ONLY when authenticated */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-white dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-white/[0.12]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <HiOutlineViewGrid className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/create"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive("/create")
                      ? "bg-white dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-white/[0.12]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <HiOutlinePlusCircle className="w-4 h-4" />
                  <span>Create Escrow</span>
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition cursor-pointer"
                title="Sign in to unlock dashboard"
              >
                <HiOutlineLockClosed className="w-3.5 h-3.5" />
                <span>Dashboard Locked (Sign In)</span>
              </button>
            )}
          </nav>

          {/* User Auth, Theme Switch & Wallet Controls */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-white/[0.1] transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <HiOutlineSun className="w-4 h-4 text-amber-400" />
              ) : (
                <HiOutlineMoon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {user.username ? `@${user.username}` : (user.name || user.email?.split("@")[0] || "User")}
                    </span>
                    <span className="block text-[10px] font-mono text-indigo-600 dark:text-cyan-400">
                      {user.userId || user.buyerId || "VERIFIED"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                  title="Logout"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openLogin}
                  className="btn-glass-secondary px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={openRegister}
                  className="btn-shimmer-primary px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Register ID
                </button>
              </div>
            )}

            {/* Wallet Extension Status */}
            <WalletStatus />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <HiOutlineSun className="w-5 h-5 text-amber-400" />
              ) : (
                <HiOutlineMoon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <HiOutlineX className="w-6 h-6 text-indigo-500" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200 dark:border-white/[0.08] px-4 pt-4 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
              isActive("/") ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30" : "text-slate-700 dark:text-slate-300"
            }`}
          >
            <HiOutlineHome className="w-5 h-5" />
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive("/dashboard") ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <HiOutlineViewGrid className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive("/create") ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <HiOutlinePlusCircle className="w-5 h-5" />
                Create Escrow
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <HiOutlineLogout className="w-5 h-5" />
                Sign Out ({user?.name || user?.userId})
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLogin();
                }}
                className="flex-1 btn-glass-secondary py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openRegister();
                }}
                className="flex-1 btn-shimmer-primary py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;