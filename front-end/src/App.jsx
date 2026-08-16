import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Link, useParams } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Wishlist from "./pages/Wishlist/Wishlist";
import Cart from "./pages/Cart/Cart";
import Login from "./pages/Login/Login";
import Footer from "./components/Footer/Footer";
import Register from "./pages/Register/Register";
import Checkout from "./pages/Checkout/Checkout";
import Deals from "./pages/Deals/Deals";
import BrandIntro from "./components/BrandIntro/BrandIntro";
import ProfilePage from "./pages/Profile/ProfilePage";

const ProductsSelector = () => {
  const { category } = useParams();
  const isNumeric = /^\d+$/.test(category || "");
  return isNumeric ? <ProductDetails /> : <Products />;
};

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <BrandIntro>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:category" element={<ProductsSelector />} />
        <Route path="/products/:category/:subcategory" element={<Products />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<div className="empty-state"><div className="empty-icon">404</div><h1>Page not found</h1><Link to="/" className="primary-btn">Back to home</Link></div>} />
      </Routes>
      <Footer />
    </BrandIntro>
  );
}

export default App;
