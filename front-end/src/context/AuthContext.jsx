import React, { createContext, useEffect, useState } from "react";
export const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("moxie_user")) || null; } catch { return null; } });
  useEffect(() => { if (user) localStorage.setItem("moxie_user", JSON.stringify(user)); else localStorage.removeItem("moxie_user"); }, [user]);
  const login = (email) => setUser({ name: email.split("@")[0], email });
  const register = (name, email) => setUser({ name, email });
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
