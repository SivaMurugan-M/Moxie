import React, { createContext, useContext, useState } from "react";

/**
 * ModalContext
 * Provides a lightweight way for any component (e.g. NavMenu) to
 * open the global Sign In modal without prop-drilling.
 */
const ModalContext = createContext(null);

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        isLoginOpen,
        openLogin:  () => setIsLoginOpen(true),
        closeLogin: () => setIsLoginOpen(false),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
