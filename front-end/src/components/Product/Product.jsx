import React from "react";
import products from "../../data/products";
import ProductCard from "./ProductCard";
import "./Product.css";

function Product() {
  // Mix all products
  const mixedProducts = [];
  const watches = products.filter(p => p.category === "Watches" || p.category === "Smart Watches");
  const shoes = products.filter(p => p.category === "Shoes");
  const buds = products.filter(p => p.category === "Air Buds");
  const caps = products.filter(p => p.category === "Caps");

  // Mix them alternately
  const maxLen = Math.max(watches.length, shoes.length, buds.length, caps.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < watches.length) mixedProducts.push(watches[i]);
    if (i < shoes.length) mixedProducts.push(shoes[i]);
    if (i < buds.length) mixedProducts.push(buds[i]);
    if (i < caps.length) mixedProducts.push(caps[i]);
  }

  // Slice into 3 rows of 6 products each
  const row1Products = mixedProducts.slice(0, 6);
  const row2Products = mixedProducts.slice(6, 12);
  const row3Products = mixedProducts.slice(12, 18);

  return (
    <section className="products">

      {/* Row 1 */}
      {row1Products.length > 0 && (
        <div className="product-row-section">
          <div className="products-header">
            <span className="products-tagline">Our Collection</span>
            <h2 className="products-heading">Featured Products</h2>
          </div>

          <div className="product-grid">
            {row1Products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      )}

      {/* Row 2 */}
      {row2Products.length > 0 && (
        <div className="product-row-section" style={{ marginTop: "24px" }}>
          <div className="product-grid">
            {row2Products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      )}

      {/* Row 3 */}
      {row3Products.length > 0 && (
        <div className="product-row-section" style={{ marginTop: "24px" }}>
          <div className="product-grid">
            {row3Products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      )}

    </section>
  );
}

export default Product;