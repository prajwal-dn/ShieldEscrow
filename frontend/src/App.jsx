import { BrowserRouter, Route, Routes } from "react-router-dom";

import CreateEscrow from "./pages/CreateEscrow.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EscrowDetails from "./pages/EscrowDetails.jsx";
import Landing from "./pages/Landing.jsx";
import AuthModal from "./components/AuthModal.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthModal />
      <Routes>
        {/* Public Route: Only Home Screen is visible until logged in */}
        <Route path="/" element={<Landing />} />

        {/* Protected Routes: Only accessible once authenticated */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateEscrow />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/escrow/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EscrowDetails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;