import React, { createContext, useContext, useState, useEffect } from "react";
import { getCategories } from "../api/categoryApi";
import { API_BASE_URL, getImageUrl } from "../api/apiConfig";

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch categories from backend API
      const catData = await getCategories();
      setCategories(catData || []);

      // Fetch products from backend API
      const response = await fetch(`${API_BASE_URL}/products/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: status ${response.status}`);
      }
      const prodData = await response.json();
      
      // Map API products to frontend shape
      const mappedProducts = (prodData || []).map((p, index) => {
        const backendImages = Array.isArray(p.images) ? p.images : [];
        const primaryImage = backendImages.find((img) => img.is_primary) || backendImages[0];
        const imageUrl = getImageUrl(primaryImage?.image);
        const imageUrls = backendImages
          .map((img) => getImageUrl(img.image))
          .filter(Boolean);
        const originalPrice = Number(p.price);
        const salePrice = p.discount_price ? Number(p.discount_price) : originalPrice;
        const discount = p.discount_price ? Math.round((1 - (salePrice / originalPrice)) * 100) : 0;

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category_slug,
          subcategory: p.subcategory_slug || "",
          price: salePrice,
          oldPrice: p.discount_price ? originalPrice : null,
          discount: discount,
          rating: parseFloat((4.2 + (p.id % 5) * 0.15).toFixed(1)), // simulated rating
          reviewCount: 30 + (p.id % 7) * 28, // simulated reviewCount
          image: imageUrl,
          images: imageUrls,
          stock: p.stock > 0,
          isNew: index % 4 === 0 || p.id > 20,
          specifications: {
            Brand: "Moxie",
            Category: p.category_name || "Accessories",
            Warranty: "6 months",
            "Country of origin": "India",
            ...(p.category_slug === "footwear" ? { "Sizes": "7, 8, 9, 10, 11, 12" } : {})
          }
        };
      });
      setProducts(mappedProducts);
    } catch (err) {
      console.error("Error loading frontend dynamic data:", err);
      setError(err.message || "Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ products, categories, loading, error, refreshData: loadData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

