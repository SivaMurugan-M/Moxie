

import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import "./Checkout.css";

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const location = useLocation();
  const checkoutItem = location.state?.checkoutItem;
  
  const [payment, setPayment] = useState("cod");
  const [placed, setPlaced] = useState(false);
  const [errors, setErrors] = useState({});

  // Use the direct checkoutItem if present, otherwise fallback to the cart list
  const checkoutList = checkoutItem ? [checkoutItem] : cart;

  const subtotal = checkoutList.reduce((s, i) => s + i.price * i.quantity, 0);
  const mrp = checkoutList.reduce((s, i) => s + i.oldPrice * i.quantity, 0);
  
  // Delivery Fee: Rs. 100 for each product
  const totalItems = checkoutList.reduce((acc, item) => acc + item.quantity, 0);
  const delivery = totalItems * 100;

  const place = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const next = {};

    ["name", "phone", "address", "city", "pincode"].forEach((k) => {
      if (!String(f.get(k) || "").trim()) next[k] = "Required";
    });

    if (String(f.get("phone") || "").replace(/\D/g, "").length !== 10) {
      next.phone = "Enter a valid 10-digit number";
    }

    if (String(f.get("pincode") || "").replace(/\D/g, "").length !== 6) {
      next.pincode = "Enter a valid 6-digit PIN";
    }

    setErrors(next);

    if (!Object.keys(next).length) {
      // Clear the cart only if checking out the cart items
      if (!checkoutItem) {
        clearCart();
      }
      setPlaced(true);
      window.scrollTo(0, 0);
    }
  };

  if (placed) {
    return (
      <main className="order-success page-shell">
        <div className="success-check">✓</div>
        <span className="eyebrow">Order confirmed</span>
        <h1>Thank you for shopping with Moxie!</h1>
        <p>Your order has been placed successfully. No payment was processed.</p>
        <Link className="primary-btn" to="/products">
          Continue shopping
        </Link>
      </main>
    );
  }

  if (!checkoutList.length) {
    return (
      <main className="empty-state">
        <div className="empty-icon">🛒</div>
        <h1>Your cart is empty</h1>
        <Link className="primary-btn" to="/products">
          Explore products
        </Link>
      </main>
    );
  }

  return (
    <main className="checkout-page page-shell">
      <span className="eyebrow">Secure checkout</span>
      <h1>Complete your order</h1>
      <form className="checkout-layout" onSubmit={place}>
        <div className="checkout-main">
          <section className="checkout-card">
            <h2>Delivery address</h2>
            <div className="form-grid">
              {[
                ["name", "Full name"],
                ["phone", "Phone number"],
                ["address", "Address"],
                ["city", "City"],
                ["pincode", "PIN code"],
              ].map(([id, label]) => (
                <label key={id} className={id === "address" ? "full" : ""}>
                  {label}
                  <input name={id} placeholder={label} />
                  {errors[id] && <small>{errors[id]}</small>}
                </label>
              ))}
            </div>
          </section>

          <section className="checkout-card">
            <h2>Payment method</h2>
            <div className="payment-options">
              {[
                ["upi", "UPI"],
                ["card", "Card"],
                ["cod", "Cash on Delivery"],
                ["wallet", "Wallet"],
              ].map(([id, title]) => (
                <label key={id} className={payment === id ? "selected" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === id}
                    onChange={() => setPayment(id)}
                  />
                  <b>{title}</b>
                </label>
              ))}
            </div>
            <p className="mock-note">Demo checkout only — no real payment occurs.</p>
          </section>
        </div>

        <aside className="order-summary">
          <h2>Order summary</h2>
          {checkoutList.map((i) => (
            <div className="summary-item" key={i.id}>
              <img src={i.image} alt="" />
              <span>
                {i.name}
                <small>
                  {i.selectedColor}
                  {i.selectedSize ? ` · Size ${i.selectedSize}` : ""} · Qty: {i.quantity}
                </small>
              </span>
              <b>₹{(i.price * i.quantity).toLocaleString("en-IN")}</b>
            </div>
          ))}
          <dl>
            <div>
              <dt>MRP</dt>
              <dd>₹{mrp.toLocaleString("en-IN")}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>−₹{(mrp - subtotal).toLocaleString("en-IN")}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>₹{delivery.toLocaleString("en-IN")}</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>₹{(subtotal + delivery).toLocaleString("en-IN")}</dd>
            </div>
          </dl>
          <button className="primary-btn">Place mock order</button>
        </aside>
      </form>
    </main>
  );
}




