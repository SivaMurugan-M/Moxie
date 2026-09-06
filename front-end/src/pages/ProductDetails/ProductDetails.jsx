import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { WishlistContext } from "../../context/WishlistContext";
import { CartContext } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import ProductShelf from "../../components/Product/ProductShelf";
import { getSaleState, getSaleStateLabel } from "../../utils/inventory";
import "./ProductDetails.css";
import "./ProductDetailsFix.css";

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

export default function ProductDetails() {
  const { productId, category } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { products, loading } = useData();

  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const product = useMemo(
    () => products.find((i) => i.id === Number(productId || category)),
    [products, productId, category]
  );

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  // Variants setup
  const variants = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }
    return [];
  }, [product]);

  const activeVariant = variants[selectedVariantIndex] || null;

  // Sizing setup
  const catText = `${product?.category || ""} ${product?.subcategory || ""}`.toLowerCase();
  const isFootwear = /shoes|footwear|sneaker|slider|slipper/i.test(catText);
  const isClothing = /shirt|t-shirt|clothing|top|pant|dress/i.test(catText);

  const availableSizes = useMemo(() => {
    if (activeVariant?.sizes && Array.isArray(activeVariant.sizes) && activeVariant.sizes.length > 0) {
      return activeVariant.sizes;
    }
    if (isFootwear) return [7, 8, 9, 10, 11, 12];
    if (isClothing) return ["S", "M", "L", "XL", "XXL"];
    return [];
  }, [activeVariant, isFootwear, isClothing]);

  // Reset page states when switching products
  useEffect(() => {
    if (!product) return;

    let viewed = [];
    try {
      viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    } catch {}
    localStorage.setItem(
      "recentlyViewed",
      JSON.stringify([product.id, ...viewed.filter((id) => id !== product.id)].slice(0, 8))
    );

    setSelectedVariantIndex(0);
    setQuantity(1);
    setActiveImage(0);
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    } else {
      setSelectedSize(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  // When variant changes, update size if needed
  useEffect(() => {
    if (availableSizes.length > 0 && (!selectedSize || !availableSizes.includes(selectedSize))) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  // Similar items
  const related = useMemo(
    () => products.filter((i) => i.category === product?.category && i.id !== product?.id),
    [products, product]
  );

  // Recently viewed
  const recentlyViewed = useMemo(() => {
    try {
      return (JSON.parse(localStorage.getItem("recentlyViewed")) || [])
        .filter((id) => id !== product?.id)
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean);
    } catch {
      return [];
    }
  }, [product, products]);

  if (loading) {
    return (
      <div
        className="container text-center py-5"
        style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <main className="empty-state">
        <div className="empty-icon">?</div>
        <h1>Product not found</h1>
        <Link className="primary-btn" to="/products">
          Browse products
        </Link>
      </main>
    );
  }

  // Dynamic Image Setup
  let images = [];
  if (activeVariant?.images && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
    images = activeVariant.images.map((img) => (typeof img === "string" ? img : img.image)).filter(Boolean);
  }
  if (images.length === 0) {
    images = product.images && product.images.length > 0 ? product.images : [product.image];
  }
  if (images.length === 0) {
    images = [getFallbackImage(product.category)];
  }

  // Active pricing & stock
  const currentPrice = activeVariant ? Number(activeVariant.discount_price || activeVariant.price || product.price) : Number(product.price);
  const currentOldPrice = activeVariant?.discount_price ? Number(activeVariant.price) : product.oldPrice ? Number(product.oldPrice) : null;
  const currentDiscount = currentOldPrice && currentOldPrice > currentPrice ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100) : product.discount || 0;

  // Sale State Resolution
  const saleState = getSaleState(product, activeVariant);
  const isAvailable = saleState === "in_stock";
  const stateLabel = getSaleStateLabel(saleState);

  const add = () => {
    if (!isAvailable) return;
    const sizeText = selectedSize ? ` (Size ${selectedSize})` : "";
    const colorText = activeVariant ? ` - ${activeVariant.color_name}` : "";
    addToCart(
      {
        ...product,
        price: currentPrice,
        oldPrice: currentOldPrice,
        selectedVariant: activeVariant,
        selectedSize: selectedSize || undefined,
      },
      quantity
    );
    toast(`${product.name}${colorText}${sizeText} added to cart`);
  };

  const buy = () => {
    if (!isAvailable) return;
    const purchaseItem = {
      ...product,
      price: currentPrice,
      oldPrice: currentOldPrice,
      selectedVariant: activeVariant,
      quantity,
      selectedSize: selectedSize || undefined,
    };
    navigate("/checkout", { state: { checkoutItem: purchaseItem } });
  };

  const wished = isInWishlist(product.id);

  return (
    <main>
      <div className="product-detail page-shell">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/products/${(product.category || "").toLowerCase().replaceAll(" ", "-")}`}>
            {product.category}
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="detail-grid">
          {/* Gallery */}
          <div className="gallery">
            <div className="gallery-thumbs">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={activeImage === index ? "active" : ""}
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image || getFallbackImage(product.category)}
                    alt=""
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getFallbackImage(product.category);
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="gallery-main">
              {currentDiscount > 0 && (
                <span className="detail-discount">{currentDiscount}% OFF</span>
              )}
              <img
                src={images[activeImage] || getFallbackImage(product.category)}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getFallbackImage(product.category);
                }}
              />
            </div>
          </div>

          {/* Product Content Details */}
          <section className="detail-copy">
            <span className="eyebrow">{product.category}</span>
            <h1>{product.name}</h1>

            <div className="detail-rating">
              <span>★ {product.rating}</span>
              <a href="#reviews">{product.reviewCount} verified reviews</a>
            </div>

            <div className="detail-price">
              <strong>₹{currentPrice.toLocaleString("en-IN")}</strong>
              {currentOldPrice && (
                <>
                  <del>₹{currentOldPrice.toLocaleString("en-IN")}</del>
                  <span>
                    You save ₹{(currentOldPrice - currentPrice).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>

            <p>{product.description}</p>

            {/* Dynamic Stock Status */}
            <div
              className={`detail-stock ${
                saleState === "in_stock" ? "yes" : "no"
              }`}
              style={{
                color:
                  saleState === "in_stock"
                    ? "#16a34a"
                    : saleState === "unstock"
                    ? "#ea580c"
                    : "#dc2626",
                fontWeight: "700",
                fontSize: "13px",
                margin: "12px 0",
              }}
            >
              {saleState === "in_stock"
                ? "● In stock and ready to dispatch"
                : saleState === "unstock"
                ? "● Currently out of stock (Unstock)"
                : "● Currently Unavailable for sale"}
            </div>

            {/* Color Variants Swatches */}
            {variants.length > 0 && (
              <div
                className="variant-colors-row"
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: "14px",
                  paddingBottom: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", fontSize: "13px" }}>Color:</span>
                  <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                    {activeVariant?.color_name || "Standard"}
                  </strong>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {variants.map((v, idx) => (
                    <button
                      key={v.id || idx}
                      onClick={() => {
                        setSelectedVariantIndex(idx);
                        setActiveImage(0);
                      }}
                      title={v.color_name}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: v.color_code || "#000",
                        border: selectedVariantIndex === idx ? "3px solid #6366f1" : "2px solid #e2e8f0",
                        boxShadow: selectedVariantIndex === idx ? "0 0 0 2px #c7d2fe" : "none",
                        cursor: "pointer",
                        outline: "none",
                        transition: "all 0.15s ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes selector if applicable */}
            {availableSizes.length > 0 && (
              <div
                className="size-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #eee",
                  paddingTop: "14px",
                  paddingBottom: "12px",
                }}
              >
                <span style={{ fontWeight: "600", fontSize: "13px" }}>Size:</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      className={selectedSize === size ? "active-size" : "size-btn"}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        border: selectedSize === size ? "2px solid #fdb101" : "1px solid #ddd",
                        backgroundColor: selectedSize === size ? "#fff4d8" : "#fff",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Controls vs Single Disabled Button (NO DUPLICATES) */}
            {isAvailable ? (
              <>
                {/* Quantity selector */}
                <div
                  className="quantity-row"
                  style={{
                    borderTop: "1px solid #eee",
                    paddingTop: "14px",
                    paddingBottom: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: "600", fontSize: "13px" }}>Quantity</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: "bold" }}
                    >
                      −
                    </button>
                    <strong>{quantity}</strong>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: "bold" }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions container */}
                <div className="detail-actions" style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button className="primary-btn" onClick={add} style={{ flex: 1 }}>
                    Add to cart
                  </button>
                  <button className="buy-button" onClick={buy} style={{ flex: 1 }}>
                    Buy now
                  </button>
                  <button
                    className={`wish-detail ${wished ? "active" : ""}`}
                    onClick={() => {
                      toggleWishlist(product);
                      toast(wished ? "Removed from wishlist" : "Saved to wishlist");
                    }}
                  >
                    {wished ? "♥ Saved" : "♡ Wishlist"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ borderTop: "1px solid #eee", paddingTop: "16px", marginTop: "10px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    disabled
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: "8px",
                      background: "#f1f5f9",
                      color: "#94a3b8",
                      border: "1px solid #e2e8f0",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "not-allowed",
                    }}
                  >
                    {stateLabel}
                  </button>
                  <button
                    className={`wish-detail ${wished ? "active" : ""}`}
                    onClick={() => {
                      toggleWishlist(product);
                      toast(wished ? "Removed from wishlist" : "Saved to wishlist");
                    }}
                    style={{ padding: "12px 18px", borderRadius: "8px" }}
                  >
                    {wished ? "♥ Saved" : "♡ Wishlist"}
                  </button>
                </div>
              </div>
            )}

            {/* Shopping guarantees info box */}
            <div className="promise-grid" style={{ marginTop: "24px" }}>
              <div>
                <b>Free delivery</b>
                <span>On orders above ₹999</span>
              </div>
              <div>
                <b>7-day returns</b>
                <span>Easy returns</span>
              </div>
              <div>
                <b>Secure checkout</b>
                <span>Protected mock payment</span>
              </div>
            </div>
          </section>
        </div>

        {/* Product details tabs: Description & Specifications */}
        <section className="detail-lower">
          <div>
            <h2>Description</h2>
            <p>
              {product.description} Every detail balances performance, value and timeless appeal.
            </p>
          </div>
          <div>
            <h2>Specifications</h2>
            <dl>
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <React.Fragment key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        </section>

        {/* Testimonials summary section */}
        <section id="reviews" className="reviews-summary">
          <span className="review-score">{product.rating}</span>
          <div>
            <h2>Customer reviews</h2>
            <div className="review-stars">★★★★★</div>
            <p>Based on {product.reviewCount} verified purchases</p>
          </div>
          <blockquote>
            “Looks premium, arrived on time and feels even better than expected.”
            <cite>— Verified Moxie shopper</cite>
          </blockquote>
        </section>
      </div>

      {/* Linked product shelves */}
      <ProductShelf eyebrow="Complete the look" title="Similar Products" products={related} />
      <ProductShelf eyebrow="Your browsing history" title="Recently Viewed" products={recentlyViewed} />
    </main>
  );
}
