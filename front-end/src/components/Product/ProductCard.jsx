import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import "./ProductCard.css";

import watchImg from "../../assets/images/watch1.png";
import shoeImg from "../../assets/images/shoe.svg";
import capImg from "../../assets/images/cap.png";
import budsImg from "../../assets/images/Buds.png";
import defaultImg from "../../assets/images/offer.png";

const getFallbackImage = (category) => {
  const cat = String(category || "").toLowerCase();
  if (cat.includes("watch")) return watchImg;
  if (cat.includes("footwear") || cat.includes("shoe") || cat.includes("slider")) return shoeImg;
  if (cat.includes("cap")) return capImg;
  if (cat.includes("gadget") || cat.includes("bud")) return budsImg;
  return defaultImg;
};

export default function ProductCard({ product }) {
  const { cart, addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const toast = useToast();
  const inCart = cart.some((item) => item.id === product.id);
  const wished = isInWishlist(product.id);

  const wishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast(wished ? "Removed from wishlist" : "Saved to wishlist");
  };

  const add = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.stock) return;
    addToCart(product);
    toast(`${product.name} added to cart`);
  };

  const fallback = getFallbackImage(product.category);

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-media">
          {product.discount > 0 && (
            <span className="discount-badge">{product.discount}% OFF</span>
          )}
          {product.isNew && <span className="new-badge">NEW</span>}
          <button
            className={`card-heart ${wished ? "active" : ""}`}
            onClick={wishlist}
          >
            {wished ? "♥" : "♡"}
          </button>
          <img
            src={product.image || fallback}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallback;
            }}
          />
        </div>
        <div className="product-card-body">
          <span className="product-category">{product.category}</span>
          <h3>{product.name}</h3>
          <div className="rating-row">
            <span className="rating-pill">★ {product.rating}</span>
            <span>({product.reviewCount})</span>
          </div>
          <div className="price-row">
            <strong>₹{product.price.toLocaleString("en-IN")}</strong>
            {product.oldPrice && (
              <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>
            )}
          </div>
          <span
            className={`stock-status ${
              product.stock ? "available" : "unavailable"
            }`}
          >
            {product.stock ? "In stock" : "Out of stock"}
          </span>
        </div>
      </Link>
      <button
        className={`add-cart-button ${inCart ? "added" : ""}`}
        disabled={!product.stock}
        onClick={add}
      >
        {!product.stock
          ? "Unavailable"
          : inCart
          ? "Add another"
          : "Add to cart"}
      </button>
    </article>
  );
}
