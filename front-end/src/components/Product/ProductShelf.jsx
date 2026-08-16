import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
export default function ProductShelf({ title, eyebrow, products, link = "/products", hideHeading = false, centerHeading = false }) { 
  if (!products?.length) return null; 
  return (
    <section className="product-shelf page-shell" style={hideHeading ? { paddingTop: "0px" } : {}}>
      {!hideHeading && (
        <div 
          className="section-heading" 
          style={centerHeading ? { 
            justifyContent: "center", 
            textAlign: "center", 
            flexDirection: "column", 
            alignItems: "center",
            gap: "4px"
          } : {}}
        >
          <div style={centerHeading ? { display: "flex", flexDirection: "column", alignItems: "center" } : {}}>
            <span 
              className="eyebrow" 
              style={centerHeading ? { 
                display: "block", 
                textAlign: "center", 
                width: "100%",
                color: "#fdb101",
                fontWeight: "800",
                fontSize: "12px",
                letterSpacing: "2px",
                marginBottom: "4px"
              } : {}}
            >
              {eyebrow}
            </span>
            <h2 style={centerHeading ? { color: "#111", fontWeight: "800" } : {}}>{title}</h2>
            {centerHeading && (
              <div 
                style={{
                  width: "55px",
                  height: "3.5px",
                  backgroundColor: "#fdb101",
                  borderRadius: "999px",
                  marginTop: "12px",
                  marginBottom: "4px"
                }}
              />
            )}
          </div>
          {!centerHeading && <Link to={link}>View all →</Link>}
        </div>
      )}
      <div className="shelf-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  ); 
}
