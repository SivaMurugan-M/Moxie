import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ModalProvider } from "./context/ModalContext";

import { DataProvider } from "./context/DataContext";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <ToastProvider>
            <AuthProvider>
                <DataProvider>
                    <WishlistProvider>
                        <CartProvider>
                            <BrowserRouter>
                                <ModalProvider>
                                    <App />
                                </ModalProvider>
                            </BrowserRouter>
                        </CartProvider>
                    </WishlistProvider>
                </DataProvider>
            </AuthProvider>
        </ToastProvider>
    </React.StrictMode>
);
