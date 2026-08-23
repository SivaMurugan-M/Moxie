import React, { createContext, useContext, useState, useEffect } from "react";
import { getCategories } from "../api/categoryApi";

const DataContext = createContext(null);
const API_ORIGIN = "http://127.0.0.1:8000";

const getImageUrl = (image) => {
  if (!image) return null;

  // DRF may return either "/media/..." or a complete URL depending on the
  // serializer context. URL handles both without creating a doubled host.
  try {
    return new URL(image, API_ORIGIN).href;
  } catch {
    return image;
  }
};

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // Fetch categories from backend API
      const catData = await getCategories();
      setCategories(catData);

      // Fetch products from backend API
      const response = await fetch(`${API_ORIGIN}/api/products/`);
      if (response.ok) {
        const prodData = await response.json();
        
        // Map API products to frontend shape
        const mappedProducts = prodData.map((p, index) => {
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
      }
    } catch (error) {
      console.error("Error loading frontend dynamic data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ products, categories, loading, refreshData: loadData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
