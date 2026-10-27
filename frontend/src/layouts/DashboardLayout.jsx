import NotificationToast from "../components/NotificationToast.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import useEscrowNotifications from "../hooks/useEscrowNotifications.js";

function DashboardLayout({ children }) {
  // Phase 3 — global WebSocket feed; broadcasts notifications to all open tabs
  const { lastNotification } = useEscrowNotifications();

  return (
    <div className="min-h-screen ambient-bg bg-grid-pattern text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-200 transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Live push notification toasts */}
      <NotificationToast notification={lastNotification} />
    </div>
  );
}

export default DashboardLayout;