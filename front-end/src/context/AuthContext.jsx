import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("moxie_user")) || null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true" || !!user;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("moxie_user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("moxie_user");
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
    }
  }, [user]);

  const login = (email) => {
    const name = email.split("@")[0];
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const userData = { name: capitalized || "User", email };
    localStorage.setItem("isLoggedIn", "true");
    setUser(userData);
    setIsLoggedIn(true);
  };

  const register = (name, email) => {
    const userData = { name: name.trim() || "User", email: email.trim() };
    localStorage.setItem("isLoggedIn", "true");
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("moxie_user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
