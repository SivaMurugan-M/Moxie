import React, { createContext, useState, useEffect } from "react";
import products from "../data/products";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const toggleWishlist = (product) => {
    const productId = typeof product === "object" ? product.id : product;
    setWishlistIds((prev) => prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]);
  };

  const addToWishlist = (product) => {
    const productId = typeof product === "object" ? product.id : product;
    setWishlistIds((prev) => prev.includes(productId) ? prev : [...prev, productId]);
  };

  const removeFromWishlist = (productId) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  };

  const isInWishlist = (productId) => wishlistIds.includes(productId);
  const wishlist = products.filter((p) => wishlistIds.includes(p.id));
  const wishlistCount = wishlistIds.length;

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistCount, toggleWishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
