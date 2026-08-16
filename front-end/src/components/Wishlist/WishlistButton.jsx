import React, { useContext } from "react";
import { WishlistContext } from "../../context/WishlistContext";
import "./WishlistButton.css";

function WishlistButton({ product, className = "" }) {
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  
  if (!product) return null;
  const isLiked = isInWishlist(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <button
      className={`wishlist-btn-shared ${isLiked ? "liked" : ""} ${className}`}
      onClick={handleClick}
      aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isLiked ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4b5c" stroke="#ff4b5c" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      )}
    </button>
  );
}

export default WishlistButton;
