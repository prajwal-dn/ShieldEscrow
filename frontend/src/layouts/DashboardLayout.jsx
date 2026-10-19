import NotificationToast from "../components/NotificationToast.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import useEscrowNotifications from "../hooks/useEscrowNotifications.js";

function DashboardLayout({ children }) {
  // Phase 3 — global WebSocket feed; broadcasts notifications to all open tabs
  const { lastNotification } = useEscrowNotifications();

  return (
    <>
      <Navbar />

      <div
        style={{
          display: "flex",
        }}
      >
        <Sidebar />

        <div
          style={{
            padding: "20px",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>

      {/* Phase 3 — live push notification toasts (bottom-right corner) */}
      <NotificationToast notification={lastNotification} />
    </>
  );
}

export default DashboardLayout;