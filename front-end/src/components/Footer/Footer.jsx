import React from "react";
import { Link } from "react-router-dom";
import categories from "../../data/categories";
import "./Footer.css";

// Import Moxie logo SVG
import Moxie from "../../assets/logo/moxie.png"

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    const input = e.target.querySelector(".newsletter-input");
    if (input && input.value) {
      alert(`Thank you for subscribing with ${input.value}!`);
      input.value = "";
    }
  };

  return (
    <footer className="footer-section">
      <div className="container footer-container">

        {/* Footer Top: Main Columns */}
        <div className="footer-grid">

          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-logo mb-3">
              <img src={Moxie} alt="Moxie Logo" width="108" height="88" className="footer-logo-img" />
            </div>
            <p className="brand-description">
              Elevate your daily style with Moxie's premium collection of watches, shoes, caps, and comfort-focused gear.
            </p>
            <div className="social-links d-flex gap-3">
              <a href="https://facebook.com" className="social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </a>
              <a href="https://instagram.com" className="social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a href="https://x.com" className="social-icon" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col links-col">
            <h4 className="footer-title">Shop Collection</h4>
            <ul className="footer-links-list">
              {categories.map((cat, index) => (
                <li key={index}>
                  <Link to={`/products/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
              <li><Link to="/products/deals">Deals</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="footer-col links-col">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/">Contact Us</Link></li>
              <li><Link to="/">FAQs</Link></li>
              <li><Link to="/">Shipping Details</Link></li>
              <li><Link to="/">Returns & Refunds</Link></li>
              <li><Link to="/">Order Tracking</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-title">Join the Club</h4>
            <p className="newsletter-text">
              Subscribe to get notified about special product drops, discounts, and style blogs.
            </p>
            <form className="newsletter-form d-flex gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>
          </div>

        </div>

        <hr className="footer-divider" />

        {/* Footer Bottom */}
        <div className="footer-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
          <p className="copyright-text mb-0">
            © {new Date().getFullYear()} Moxie. All rights reserved.
          </p>
          <button onClick={scrollToTop} className="scroll-to-top-btn" aria-label="Scroll to top">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
