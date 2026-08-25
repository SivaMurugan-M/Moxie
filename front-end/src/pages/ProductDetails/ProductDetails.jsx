import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { WishlistContext } from "../../context/WishlistContext";
import { CartContext } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import ProductShelf from "../../components/Product/ProductShelf";
import "./ProductDetails.css";
import "./ProductDetailsFix.css";

export default function ProductDetails() {
    const { productId, category } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { products, loading } = useData();

    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    const product = useMemo(() => products.find((i) => i.id === Number(productId || category)), [products, productId, category]);

    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(7);
    // Reset page states when switching products
    useEffect(() => {
        if (!product) return;

        // Save current product to recently viewed list in localStorage (up to 8 items)
        let viewed = [];
        try {
            viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
        } catch { }
        localStorage.setItem(
            "recentlyViewed",
            JSON.stringify([product.id, ...viewed.filter((id) => id !== product.id)].slice(0, 8))
        );

        setQuantity(1);
        setActiveImage(0);
        setSelectedSize(7);
    }, [product]);

    // Filter similar items within the same category
    const related = useMemo(
        () => products.filter((i) => i.category === product?.category && i.id !== product?.id),
        [products, product]
    );

    // Retrieve recently viewed product items from history
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
            <div className="container text-center py-5" style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                <Link className="primary-btn" to="/products">Browse products</Link>
            </main>
        );
    }

    // Dynamic Image Setup: 
    // If product.images array is defined in products.js, display those different pictures.
    // Otherwise, fallback to repeating the main product.image for thumbnails.
    const images = product.images && product.images.length > 0
        ? product.images
        : [product.image, product.image, product.image];

    const isFootwear = ["shoes", "sliders", "footwear"].includes(product.category?.toLowerCase());

    const add = () => {
        const sizeText = isFootwear ? ` (Size ${selectedSize})` : "";
        addToCart({ ...product, selectedSize }, quantity);
        toast(`${product.name}${sizeText} added to cart`);
    };

    const buy = () => {
        const purchaseItem = {
            ...product,
            quantity,
            ...(isFootwear ? { selectedSize } : {})
        };
        navigate("/checkout", { state: { checkoutItem: purchaseItem } });
    };

    const wished = isInWishlist(product.id);

    return (
        <main>
            <div className="product-detail page-shell">

                {/* Breadcrumb links */}
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

                    {/* Gallery: Thumbnail column and main display area */}
                    <div className="gallery">
                        <div className="gallery-thumbs">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    className={activeImage === index ? "active" : ""}
                                    onClick={() => setActiveImage(index)}
                                >
                                    <img src={image} alt="" />
                                </button>
                            ))}
                        </div>
                        <div className="gallery-main">
                            {product.discount > 0 && <span className="detail-discount">{product.discount}% OFF</span>}
                            <img src={images[activeImage]} alt={product.name} />
                        </div>
                    </div>

                    {/* Product content descriptors */}
                    <section className="detail-copy">
                        <span className="eyebrow">{product.category}</span>
                        <h1>{product.name}</h1>

                        <div className="detail-rating">
                            <span>★ {product.rating}</span>
                            <a href="#reviews">{product.reviewCount} verified reviews</a>
                        </div>

                        <div className="detail-price">
                            <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                            {product.oldPrice && (
                                <>
                                    <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>
                                    <span>You save ₹{(product.oldPrice - product.price).toLocaleString("en-IN")}</span>
                                </>
                            )}
                        </div>

                        <p>{product.description}</p>

                        <div className={`detail-stock ${product.stock ? "yes" : "no"}`}>
                            {product.stock ? "● In stock and ready to dispatch" : "● Currently out of stock"}
                        </div>

                        {/* Options display when product is in stock */}
                        {product.stock && (
                            <>
                                {/* UK Sizes selector for footwear category */}
                                {isFootwear && (
                                    <div
                                        className="size-row"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            borderTop: "1px solid #eee",
                                            paddingTop: "18px",
                                            paddingBottom: "12px",
                                        }}
                                    >
                                        <span>Size</span>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            {[7, 8, 9, 10, 11, 12].map((size) => (
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
                                                    }}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity selector */}
                                <div
                                    className="quantity-row"
                                    style={{
                                        borderTop: isFootwear
                                            ? "none"
                                            : "1px solid #eee",
                                    }}
                                >
                                    <span>Quantity</span>
                                    <div>
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                        <strong>{quantity}</strong>
                                        <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                    </div>
                                </div>

                                {/* Actions container */}
                                <div className="detail-actions">
                                    <button className="primary-btn" onClick={add}>
                                        Add to cart
                                    </button>
                                    <button className="buy-button" onClick={buy}>
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
                        )}

                        {/* Shopping guarantees info box */}
                        <div className="promise-grid">
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
                        <p>{product.description} Every detail balances performance, value and timeless appeal.</p>
                    </div>
                    <div>
                        <h2>Specifications</h2>
                        <dl>
                            {Object.entries(product.specifications).map(([key, value]) => (
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
