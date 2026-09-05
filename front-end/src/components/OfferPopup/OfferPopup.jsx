import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppIcon, CancelIcon, SparklesIcon, ShoppingBagIcon } from "../../icons";
import "./OfferPopup.css";
import { API_BASE_URL } from "../../api/apiConfig";

function OfferPopup() {
  const [offer, setOffer] = useState(null);   // null = no offer / loading
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const closedRef = React.useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCurrentOffer = async () => {
      const url = `${API_BASE_URL}/offers/current/`;
      try {
        const res = await fetch(url, {
          cache: "no-store", // always fetch fresh — no stale popup
        });
        if (!res.ok) {
          if (!cancelled) setOffer(null);
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        if (data && data.offer && typeof data.offer.offer_text === "string" && data.offer.offer_text.trim().length > 0) {
          // If the user already dismissed this exact offer during this page session, do not re-open
          if (closedRef.current === data.offer.id) {
            return;
          }

          setOffer(data.offer);

          // If the 3.5s watch intro animation is playing, wait until it finishes before showing popup
          const isIntroActive = document.body.classList.contains("is-loading");
          const delay = isIntroActive ? 3600 : 150;

          setTimeout(() => {
            if (!cancelled && closedRef.current !== data.offer.id) {
              setVisible(true);
            }
          }, delay);
        } else {
          setOffer(null);
          setVisible(false);
        }
      } catch (err) {
        if (!cancelled) setOffer(null);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    fetchCurrentOffer();

    // Re-check periodically every 60 seconds for scheduled offer activations/expirations
    const intervalId = setInterval(fetchCurrentOffer, 60000);

    // Re-check when user switches back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCurrentOffer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleClose = () => {
    if (offer && offer.id) {
      closedRef.current = offer.id;
    }
    setVisible(false);
    // Wait for fade-out before unmounting
    setTimeout(() => setOffer(null), 320);
  };

  // Only render once loaded and an offer with non-empty text exists
  if (!loaded || !offer || !offer.offer_text || !offer.offer_text.trim()) return null;

  return (
    <div
      className={`offer-popup-overlay ${visible ? "offer-popup-overlay--visible" : ""}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Special Offer"
    >
      <div className={`offer-popup-card ${visible ? "offer-popup-card--visible" : ""}`}>
        {/* Close button */}
        <button
          className="offer-popup-close"
          onClick={handleClose}
          aria-label="Close offer popup"
        >
          <AppIcon icon={CancelIcon} size={18} />
        </button>

        {/* Top sparkle bar */}
        <div className="offer-popup-topbar">
          <span className="offer-popup-tag d-inline-flex align-items-center gap-1">
            <AppIcon icon={SparklesIcon} size={14} /> SPECIAL OFFER <AppIcon icon={SparklesIcon} size={14} />
          </span>
        </div>

        {/* Main offer text */}
        <div className="offer-popup-body">
          <p className="offer-popup-text">{offer.offer_text}</p>
        </div>

        {/* CTA */}
        <div className="offer-popup-footer">
          <Link to="/products" className="offer-popup-cta d-inline-flex align-items-center gap-2 justify-content-center" onClick={handleClose}>
            <AppIcon icon={ShoppingBagIcon} size={18} />
            <span>Shop Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OfferPopup;

