import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { WishlistContext } from "../../context/WishlistContext";
import ProductCard from "../../components/Product/ProductCard";
import "./Wishlist.css";

function Wishlist() {
  const { wishlist } = useContext(WishlistContext);

  return (
    <div className="container py-5 wishlist-page-section">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <span className="text-muted text-uppercase fw-bold fs-8 tracking-wider">My Account</span>
          <h1 className="wishlist-heading-title m-0 mt-1">Your Wishlist</h1>
        </div>
        {wishlist.length > 0 && (
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
            {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
          </span>
        )}
      </div>

      {wishlist.length > 0 ? (
        <div className="row g-4">
          {wishlist.map((product) => (
            <div key={product.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="wishlist-empty-state text-center py-5 bg-white rounded-4 border border-light shadow-sm">
          <div className="wishlist-empty-icon mb-4 text-muted opacity-50">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h3 className="fw-bold mb-2">Your Wishlist is Empty</h3>
          <p className="text-muted mb-4 px-3 mx-auto" style={{ maxWidth: "400px" }}>
            Save products you love and come back to them later. Explore our premium store collections to get started!
          </p>
          <Link
            to="/products"
            className="btn btn-warning rounded-pill px-4 py-2.5 fw-bold wishlist-continue-shopping-btn"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
