import React from "react";
import "./Offer.css";

function Offer() {
  const offers = [
    "🚚 Free Delivery on Orders ₹999+",
    "🎉 Flat 20% OFF on Smart Watches",
    "💳 Secure Payments Available",
    "🔄 Easy Returns Within 7 Days",
  ];

  return (
    <div className="offer-bar container">
      <div className="offer-track">
        {offers.map((offer, index) => (
          <span key={index} className="offer-item">
            {offer}
          </span>
        ))}
        {/* Duplicate the offers to create a seamless looping effect */}
        {offers.map((offer, index) => (
          <span key={`dup-${index}`} className="offer-item">
            {offer}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Offer;
