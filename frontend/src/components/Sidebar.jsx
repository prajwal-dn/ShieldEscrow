import { Link, useLocation } from "react-router-dom";
import { 
  HiOutlineViewGrid, 
  HiOutlinePlusCircle, 
  HiOutlineShieldCheck, 
  HiOutlineExternalLink,
  HiOutlineCubeTransparent
} from "react-icons/hi";

function Sidebar() {
  const location = useLocation();

  const navItems = [
    {
      to: "/dashboard",
      icon: <HiOutlineViewGrid className="w-5 h-5" />,
      label: "Dashboard",
      badge: null,
    },
    {
      to: "/create",
      icon: <HiOutlinePlusCircle className="w-5 h-5" />,
      label: "Create Escrow",
      badge: "NEW",
    },
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col justify-between shrink-0 min-h-[calc(100vh-80px)] p-5 border-r border-slate-200/80 dark:border-white/[0.07] bg-white/60 dark:bg-[#070b14]/60 backdrop-blur-xl transition-colors duration-200">
      <div className="space-y-6">
        {/* Navigation Category */}
        <div>
          <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3">
            Navigation
          </p>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group ${
                    active
                      ? "bg-indigo-50 dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-white/[0.12] shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-indigo-500"} transition-colors`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Protocol Resources */}
        <div>
          <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3">
            Security & Protocol
          </p>
          <div className="space-y-1.5">
            <a
              href="https://github.com/prajwal-dn/ShieldEscrow"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition group"
            >
              <div className="flex items-center gap-3">
                <HiOutlineShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>Smart Contracts</span>
              </div>
              <HiOutlineExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            <a
              href="https://docs.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition group"
            >
              <div className="flex items-center gap-3">
                <HiOutlineCubeTransparent className="w-5 h-5 text-indigo-500" />
                <span>Midnight ZK Docs</span>
              </div>
              <HiOutlineExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>

      {/* Network & Protocol Status Widget */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.06]">
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                MIDNIGHT PREPROD
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            Zero-knowledge cryptographic custody & multi-sig arbitration.
          </p>

          <Link
            to="/create"
            className="w-full btn-shimmer-primary py-2 rounded-xl text-xs font-semibold text-center"
          >
            + Create New Escrow
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;