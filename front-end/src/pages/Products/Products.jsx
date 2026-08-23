import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import ProductCard from "../../components/Product/ProductCard";
import "./Products.css";

const PAGE_SIZE = 9;

export default function Products() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { category, subcategory } = useParams();
  const { categories, products, loading } = useData();

  const slug = category || "";
  const subSlug = subcategory || "";

  const [query, setQuery] = useState(new URLSearchParams(search).get("search") || "");
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState("all");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sort, setSort] = useState(new URLSearchParams(search).get("sort") || "recommended");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategory = useMemo(() => categories.find((c) => c.slug === slug), [categories, slug]);
  const activeSubcategory = useMemo(() => activeCategory?.subcategories?.find((s) => s.slug === subSlug), [activeCategory, subSlug]);

  useEffect(() => {
    setQuery(new URLSearchParams(search).get("search") || "");
    setSort(new URLSearchParams(search).get("sort") || "recommended");
    setVisible(PAGE_SIZE);
  }, [search, pathname]);

  const result = useMemo(() => {
    let list = [...products];

    if (slug === "deals") {
      list = list.filter((p) => p.discount >= 30);
    } else if (activeCategory) {
      list = list.filter((p) => p.category === slug);
      if (subSlug) {
        list = list.filter((p) => p.subcategory === subSlug);
      }
    }

    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) => `${p.name} ${p.category} ${p.subcategory || ""} ${p.keywords}`.toLowerCase().includes(term)
      );
    }

    list = list.filter(
      (p) => p.price <= maxPrice && p.rating >= minRating && p.discount >= minDiscount
    );

    if (availability === "stock") {
      list = list.filter((p) => p.stock);
    }
    if (availability === "out") {
      list = list.filter((p) => !p.stock);
    }

    const sorters = {
      "price-low": (a, b) => a.price - b.price,
      "price-high": (a, b) => b.price - a.price,
      newest: (a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id,
      popularity: (a, b) => b.popularity - a.popularity,
      rating: (a, b) => b.rating - a.rating,
      recommended: (a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount,
    };

    return list.sort(sorters[sort]);
  }, [products, slug, subSlug, activeCategory, query, maxPrice, minRating, availability, minDiscount, sort]);

  if (loading) {
    return (
      <div className="container text-center py-5" style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading products...</span>
        </div>
      </div>
    );
  }

  const reset = () => {
    setQuery("");
    setMaxPrice(15000);
    setMinRating(0);
    setAvailability("all");
    setMinDiscount(0);
    setSort("recommended");
    setVisible(PAGE_SIZE);
  };

  const headingTitle = slug === "deals"
    ? "Hot Deals"
    : activeSubcategory
      ? `${activeCategory?.name} - ${activeSubcategory?.name}`
      : activeCategory?.name || "All Products";

  const filters = (
    <div className="filter-panel">
      <div className="filter-head">
        <h2>Filters</h2>
        <button onClick={() => setFiltersOpen(false)}>×</button>
      </div>

      <label>Search</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Name, category or keyword"
      />

      <label>Category</label>
      <select
        value={slug || "all"}
        onChange={(e) => navigate(e.target.value === "all" ? "/products" : `/products/${e.target.value}`)}
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <label>Price up to ₹{maxPrice.toLocaleString("en-IN")}</label>
      <input
        type="range"
        min="500"
        max="15000"
        step="500"
        value={maxPrice}
        onChange={(e) => setMaxPrice(Number(e.target.value))}
      />

      <label>Rating</label>
      <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
        <option value="0">All ratings</option>
        <option value="4">4★ & above</option>
        <option value="4.5">4.5★ & above</option>
      </select>

      <label>Availability</label>
      <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
        <option value="all">All products</option>
        <option value="stock">In stock</option>
        <option value="out">Out of stock</option>
      </select>

      <label>Discount</label>
      <select value={minDiscount} onChange={(e) => setMinDiscount(Number(e.target.value))}>
        <option value="0">Any discount</option>
        <option value="20">20% or more</option>
        <option value="30">30% or more</option>
      </select>

      <button className="secondary-btn filter-reset" onClick={reset}>
        Reset filters
      </button>
    </div>
  );

  return (
    <main className="catalog-page page-shell">
      <div className="catalog-heading">
        <div>
          <span className="eyebrow">Moxie collection</span>
          <h1>{headingTitle}</h1>
          <p>{result.length} products found</p>
        </div>
        <div className="catalog-actions">
          <button className="mobile-filter-button" onClick={() => setFiltersOpen(true)}>
            ☰ Filters
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="popularity">Popularity</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <div className="catalog-layout">
        <aside className="desktop-filters">{filters}</aside>
        {filtersOpen && (
          <>
            <button className="drawer-scrim" onClick={() => setFiltersOpen(false)} />
            <aside className="mobile-filter-drawer">{filters}</aside>
          </>
        )}
        <section>
          {result.length ? (
            <>
              <div className="product-grid">
                {result.slice(0, visible).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {visible < result.length && (
                <button className="load-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Load more products
                </button>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h2>No products found</h2>
              <p>Try a broader search or clear your filters.</p>
              <button className="primary-btn" onClick={reset}>
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
