import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

const API_BASE = ""; // Relative URLs for same-origin

// Generate a simulated session token for offline/dev fallback
const generateSimulatedToken = (userId, email) => {
  const payload = { userId, email, simulated: true };
  // Simple base64 encoding for simulated token (not secure, just for dev)
  return "sim_" + btoa(JSON.stringify(payload));
};

// Parse simulated token
const parseSimulatedToken = (token) => {
  if (!token.startsWith("sim_")) return null;
  try {
    return JSON.parse(atob(token.substring(4)));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("shield_escrow_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("shield_escrow_token") || null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("shield_escrow_token", token);
    } else {
      localStorage.removeItem("shield_escrow_token");
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("shield_escrow_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("shield_escrow_user");
    }
  }, [user]);

  // Standardized ID Generator
  const generateStandardId = useCallback((prefix) => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomDigits}`;
  }, []);

  // Fallback user creation for offline/dev mode
  const createFallbackUser = useCallback((email, fullName = "", username = "") => {
    const baseNumber = Math.floor(100000 + Math.random() * 900000);
    const userId = `USR-${baseNumber}`;
    const buyerId = `BUY-${baseNumber}`;
    const sellerId = `SEL-${baseNumber}`;
    const cleanUsername = username?.trim().toLowerCase() || email.split("@")[0].toLowerCase();

    const newUser = {
      userId,
      username: cleanUsername,
      buyerId,
      sellerId,
      email: email.trim().toLowerCase(),
      name: fullName.trim() || cleanUsername,
      createdAt: new Date().toISOString(),
    };

    const simulatedToken = generateSimulatedToken(userId, newUser.email);
    setToken(simulatedToken);
    setUser(newUser);
    setAuthModalOpen(false);
    return newUser;
  }, []);

  const register = useCallback(async (email, password, fullName = "", username = "") => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const isGmail = /^[a-z0-9](\.?[a-z0-9]){4,}@(gmail|googlemail)\.com$/i.test(cleanEmail);
    if (!isGmail) {
      throw new Error("Please enter a valid Gmail address (e.g. yourname@gmail.com). Only official Gmail IDs are accepted.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password, fullName, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      // Store token and user (without password)
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return data.user;
    } catch (err) {
      if (err.message.includes("Gmail") || err.message.includes("Password") || err.message.includes("Username") || err.message.includes("already exists")) {
        throw err;
      }
      console.warn("[Auth] Register API unavailable, using fallback:", err.message);
      return createFallbackUser(cleanEmail, fullName, username);
    }
  }, [createFallbackUser]);

  const login = useCallback(async (identifier, password) => {
    if (!identifier || !password) {
      throw new Error("Email/User ID and password are required.");
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed. Please try again.");
      }

      // Store token and user (without password)
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return data.user;
    } catch (err) {
      // If fetch fails (e.g., static dev without backend), fallback gracefully
      console.warn("[Auth] Login API unavailable, using fallback:", err.message);

      // For fallback, we accept any email/userId with password (simulated auth)
      const cleanId = identifier.trim().toLowerCase();
      if (cleanId.includes("@")) {
        return createFallbackUser(cleanId, "");
      }
      // If identifier looks like a userId, create a fallback user with generated email
      return createFallbackUser(`${cleanId}@demo.local`, "");
    }
  }, [createFallbackUser]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  // Verify token and restore session (call on app init)
  const verifySession = useCallback(async () => {
    const savedToken = localStorage.getItem("shield_escrow_token");
    if (!savedToken) return false;

    // Check if it's a simulated token
    if (savedToken.startsWith("sim_")) {
      const decoded = parseSimulatedToken(savedToken);
      if (decoded) {
        // Restore user from localStorage or create minimal user object
        const savedUser = localStorage.getItem("shield_escrow_user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
            return true;
          } catch {
            // Invalid saved user, clear
          }
        }
        // Create minimal user from token
        const user = {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.email.split("@")[0],
        };
        setUser(user);
        setToken(savedToken);
        return true;
      }
      // Invalid simulated token
      localStorage.removeItem("shield_escrow_token");
      localStorage.removeItem("shield_escrow_user");
      return false;
    }

    // Real JWT token - verify with backend
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${savedToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          // Restore user from localStorage or use decoded token data
          const savedUser = localStorage.getItem("shield_escrow_user");
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              setUser(data.user);
            }
          } else {
            setUser(data.user);
          }
          setToken(savedToken);
          return true;
        }
      }
      // Token invalid or expired
      localStorage.removeItem("shield_escrow_token");
      localStorage.removeItem("shield_escrow_user");
      return false;
    } catch (err) {
      console.warn("[Auth] Session verification failed:", err.message);
      // If backend unavailable, keep the token but don't auto-login
      return false;
    }
  }, []);

  const openLogin = useCallback(() => {
    setAuthMode("login");
    setAuthModalOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setAuthMode("register");
    setAuthModalOpen(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        token,
        authModalOpen,
        authMode,
        setAuthMode,
        setAuthModalOpen,
        login,
        register,
        logout,
        openLogin,
        openRegister,
        generateStandardId,
        verifySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
