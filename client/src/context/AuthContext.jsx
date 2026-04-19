import React, { createContext, useContext, useState, useEffect } from "react";

// Create Context
const AuthContext = createContext(null);

// Provider Component
export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if it exists
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    console.log("AuthContext Init: Saved user found:", savedUser ? "Yes" : "No");
    
    // ✅ DIRECT URL ACCESS BYPASS: If no user is logged in, default to Master Admin
    // This allows typing URLs directly without being redirected to Login.
    if (!savedUser) {
      return { 
        name: "Master Admin (Demo)", 
        role: "admin", 
        token: "demo-token" 
      };
    }
    
    return JSON.parse(savedUser);
  });

  // login function to set user and save to localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // logout function to clear user and remove from localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Optional: Sync tab logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user" && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use context
export const useAuth = () => useContext(AuthContext);