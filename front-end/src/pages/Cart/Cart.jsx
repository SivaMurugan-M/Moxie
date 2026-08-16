import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import "./Cart.css";

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const toast = useToast();

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const originalTotal = cart.reduce((acc,item)=>acc+item.oldPrice*item.quantity,0);
  const discount=originalTotal-subtotal;
  
  // Shipping Fee: Rs. 100 for each product
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const shippingFee = totalItems * 100;
  const total = subtotal + shippingFee;

  return (
    <div className="container py-5 cart-page-section">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <span className="text-muted text-uppercase fw-bold fs-8 tracking-wider">Your Shopping Bag</span>
          <h1 className="cart-heading-title m-0 mt-1">Shopping Cart</h1>
        </div>
        {cart.length > 0 && (
          <button className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold" onClick={clearCart}>
            Clear Bag
          </button>
        )}
      </div>

      {cart.length > 0 ? (
        <div className="row g-4">
          {/* Cart items list */}
          <div className="col-lg-8">
            <div className="cart-items-wrapper p-4 bg-white rounded-4 border border-light shadow-sm">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="cart-item d-flex align-items-center justify-content-between py-3 border-bottom last-border-none">
                  {/* Image & Product info */}
                  <div className="d-flex align-items-center gap-3" style={{ flex: "1" }}>
                    <div className="cart-item-img-container p-2 rounded-3 border border-light bg-light-subtle d-flex align-items-center justify-content-center">
                      <img src={item.image} alt={item.name} className="img-fluid cart-item-image" />
                    </div>
                    <div className="cart-item-info">
                      <Link to={`/products/${item.id}`} className="text-decoration-none text-dark">
                        <h4 className="cart-item-title fw-bold m-0 mb-1">{item.name}</h4>
                      </Link>
                      <span className="cart-item-category text-muted text-uppercase d-block mb-1">{item.category}</span>
                      {item.selectedSize && (
                        <span className="badge bg-secondary-subtle text-secondary fw-bold">Size: {item.selectedSize}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity picker & calculations */}
                  <div className="d-flex align-items-center justify-content-end gap-4" style={{ minWidth: "280px" }}>
                    <div className="cart-item-qty d-flex align-items-center border rounded-pill" style={{ overflow: "hidden" }}>
                      <button className="btn btn-link px-2.5 py-1 text-dark text-decoration-none fw-bold" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span className="qty-value px-1.5 fw-bold text-dark">{item.quantity}</span>
                      <button className="btn btn-link px-2.5 py-1 text-dark text-decoration-none fw-bold" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>

                    <div className="cart-item-price-calc text-end">
                      <span className="cart-item-price fw-bold text-dark d-block">Rs. {(item.price * item.quantity).toLocaleString("en-IN")}.00</span>
                      <span className="cart-item-unit-price text-muted fs-8">Rs. {item.price.toLocaleString("en-IN")} each</span>
                    </div>

                    <button className="btn btn-link text-danger p-0 border-0" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                    <button className="btn btn-link text-dark p-0 border-0 fs-8" onClick={()=>{addToWishlist(item);removeFromCart(item.id);toast("Moved to wishlist")}}>Save</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout billing info */}
          <div className="col-lg-4">
            <div className="checkout-summary-panel p-4 bg-white rounded-4 border border-light shadow-sm">
              <h3 className="summary-title fw-bold mb-4">Order Summary</h3>

              <div className="summary-row d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal</span>
                <span className="fw-semibold text-dark">Rs. {originalTotal.toLocaleString("en-IN")}.00</span>
              </div>

              <div className="summary-row d-flex justify-content-between mb-3">
                <span className="text-muted">Product discount</span>
                <span className="fw-semibold text-success">− Rs. {discount.toLocaleString("en-IN")}.00</span>
              </div>

              <div className="summary-row d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping Fee</span>
                <span className="fw-semibold text-dark">
                  Rs. {shippingFee.toLocaleString("en-IN")}.00
                </span>
              </div>

              <hr className="my-4" />

              <div className="summary-total d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5 text-dark">Total</span>
                <span className="fw-bold fs-5 text-danger">Rs. {total.toLocaleString("en-IN")}.00</span>
              </div>

              <Link to="/checkout" className="btn btn-warning w-100 rounded-pill py-3 fw-bold checkout-btn mb-2">
                PROCEED TO CHECKOUT
              </Link>

              <Link to="/products" className="btn btn-outline-dark w-100 rounded-pill py-3 fw-bold" style={{ textDecoration: "none" }}>
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="cart-empty-state text-center py-5 bg-white rounded-4 border border-light shadow-sm">
          <div className="cart-empty-icon mb-4 text-muted opacity-50">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h3 className="fw-bold mb-2">Your Shopping Cart is Empty</h3>
          <p className="text-muted mb-4 px-3 mx-auto" style={{ maxWidth: "400px" }}>
            Add items you want to purchase to your bag. Browse our products and pick something special!
          </p>
          <Link
            to="/products"
            className="btn btn-warning rounded-pill px-4 py-2.5 fw-bold cart-continue-shopping-btn"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

export default Cart;
