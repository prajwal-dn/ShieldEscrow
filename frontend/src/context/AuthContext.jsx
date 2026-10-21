import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("shield_escrow_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  useEffect(() => {
    if (user) {
      localStorage.setItem("shield_escrow_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("shield_escrow_user");
    }
  }, [user]);

  // Standardized ID Generator
  const generateStandardId = (prefix) => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomDigits}`;
  };

  const register = async (email, password, fullName = "") => {
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid Gmail / Email address.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const baseNumber = Math.floor(100000 + Math.random() * 900000);
    const userId = `USR-${baseNumber}`;
    const buyerId = `BUY-${baseNumber}`;
    const sellerId = `SEL-${baseNumber}`;

    const newUser = {
      userId,
      buyerId,
      sellerId,
      email: email.trim().toLowerCase(),
      name: fullName.trim() || email.split("@")[0],
      createdAt: new Date().toISOString(),
    };

    // Store in existing users list in localStorage for simulation
    const users = JSON.parse(localStorage.getItem("shield_escrow_all_users") || "[]");
    const existing = users.find((u) => u.email === newUser.email);
    if (existing) {
      throw new Error("An account with this email already exists. Please log in.");
    }

    users.push({ ...newUser, password });
    localStorage.setItem("shield_escrow_all_users", JSON.stringify(users));

    setUser(newUser);
    setAuthModalOpen(false);
    return newUser;
  };

  const login = async (identifier, password) => {
    const users = JSON.parse(localStorage.getItem("shield_escrow_all_users") || "[]");
    const cleanId = identifier.trim().toLowerCase();

    // Match by email or userId
    const matched = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || u.userId.toLowerCase() === cleanId) &&
        u.password === password
    );

    if (!matched) {
      // If no users registered yet, allow demo registration or throw
      if (users.length === 0 && cleanId.includes("@")) {
        return register(cleanId, password);
      }
      throw new Error("Invalid User ID/Email or password.");
    }

    const { password: _, ...safeUser } = matched;
    setUser(safeUser);
    setAuthModalOpen(false);
    return safeUser;
  };

  const logout = () => {
    setUser(null);
  };

  const openLogin = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
