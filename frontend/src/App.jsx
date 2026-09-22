import { BrowserRouter, Route, Routes } from "react-router-dom";

import CreateEscrow from "./pages/CreateEscrow.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EscrowDetails from "./pages/EscrowDetails.jsx";
import Landing from "./pages/Landing.jsx";

import DashboardLayout from "./layouts/DashboardLayout.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/create"
          element={
            <DashboardLayout>
              <CreateEscrow />
            </DashboardLayout>
          }
        />

        <Route
          path="/escrow/:id"
          element={
            <DashboardLayout>
              <EscrowDetails />
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;