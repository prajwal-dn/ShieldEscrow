import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, openLogin } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      openLogin();
    }
  }, [isAuthenticated, openLogin]);

  if (!isAuthenticated) {
    // Only logged in users can see the dashboard and app routes; redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
}
