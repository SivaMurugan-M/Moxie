import React, { useState, useEffect } from "react";
import "./Offer.css";
import { API_BASE_URL } from "../../api/apiConfig";

function Offer() {
  const [offerItems, setOfferItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const parseOfferItems = (data) => {
      if (!data) return [];

      // 1. If data.active_offers is provided, collect all lines across all active offers
      if (Array.isArray(data.active_offers) && data.active_offers.length > 0) {
        const combined = [];
        for (const item of data.active_offers) {
          if (Array.isArray(item.lines) && item.lines.length > 0) {
            combined.push(...item.lines.map(l => String(l).trim()).filter(Boolean));
          } else {
            const txt = (item.offer_text || item.name || item.title || item.description || "").trim();
            if (txt) {
              const parts = txt
                .split(/(?<=[.!?])\s+|(?<=[.!?])(?=[A-Z0-9])|\r?\n+/g)
                .map(s => s.trim())
                .filter(Boolean);
              combined.push(...(parts.length > 0 ? parts : [txt]));
            }
          }
        }
        if (combined.length > 0) return combined;
      }

      // 2. If data.offers is an array containing all active offer lines
      if (Array.isArray(data.offers) && data.offers.length > 0) {
        const valid = data.offers.map(l => String(l).trim()).filter(Boolean);
        if (valid.length > 0) return valid;
      }

      // 3. Fallback to single offer if only one was returned
      if (data.offer) {
        if (Array.isArray(data.offer.lines) && data.offer.lines.length > 0) {
          const valid = data.offer.lines.map(l => String(l).trim()).filter(Boolean);
          if (valid.length > 0) return valid;
        }

        const rawText = data.offer.offer_text || data.offer.name || data.offer.title || data.offer.description || "";
        if (rawText && typeof rawText === "string" && rawText.trim()) {
          const trimmed = rawText.trim();
          const parts = trimmed
            .split(/(?<=[.!?])\s+|(?<=[.!?])(?=[A-Z0-9])|\r?\n+/g)
            .map(s => s.trim())
            .filter(Boolean);

          return parts.length > 0 ? parts : [trimmed];
        }
      }

      return [];
    };

    const fetchCurrentOffer = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/offers/current/`, {
          cache: "no-store",
          headers: {
            "Accept": "application/json"
          }
        });
        if (!res.ok) {
          if (!cancelled) setOfferItems([]);
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        const items = parseOfferItems(data);
        setOfferItems(items);
      } catch (err) {
        if (!cancelled) setOfferItems([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    fetchCurrentOffer();

    // Re-check periodically every 15 seconds
    const intervalId = setInterval(fetchCurrentOffer, 15000);

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

  // Do not show anything if not loaded or if no active offer is present
  if (!loaded || !offerItems || offerItems.length === 0) {
    return null;
  }

  // Ensure enough items to fill the marquee track seamlessly
  let displayList = [...offerItems];
  while (displayList.length < 6) {
    displayList = [...displayList, ...offerItems];
  }

  return (
    <aside className="offer-announcement-bar" aria-label="Promotional Announcement">
      <div className="offer-marquee-container">
        <div className="offer-marquee-track">
          {displayList.map((item, index) => (
            <div key={`orig-${index}`} className="offer-item">
              <span className="offer-sparkle">✦</span>
              <span className="offer-text">{item}</span>
            </div>
          ))}
          {/* Duplicated track for endless, jump-free CSS marquee loop */}
          {displayList.map((item, index) => (
            <div key={`dup-${index}`} className="offer-item" aria-hidden="true">
              <span className="offer-sparkle">✦</span>
              <span className="offer-text">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Offer;
