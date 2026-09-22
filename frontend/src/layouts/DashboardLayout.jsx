import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

function DashboardLayout({ children }) {
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
    </>
  );
}

export default DashboardLayout;