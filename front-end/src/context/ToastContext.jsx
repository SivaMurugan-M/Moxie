import React, { createContext, useCallback, useContext, useState } from "react";
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);
export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const showToast = useCallback((text) => { setMessage(text); window.clearTimeout(window.__moxieToastTimer); window.__moxieToastTimer = window.setTimeout(() => setMessage(""), 2400); }, []);
  return <ToastContext.Provider value={showToast}>{children}<div className={`app-toast ${message ? "show" : ""}`} role="status">{message}</div></ToastContext.Provider>;
}
