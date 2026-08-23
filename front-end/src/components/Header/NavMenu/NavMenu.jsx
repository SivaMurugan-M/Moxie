import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { WishlistContext } from "../../../context/WishlistContext";
import { CartContext } from "../../../context/CartContext";
import { AuthContext } from "../../../context/AuthContext";
import { useData } from "../../../context/DataContext";
import CategoryIcon from "../../../assets/icons/categories.svg";
import WishlistIcon from "../../../assets/icons/wishlist.svg";
import CartIcon from "../../../assets/icons/cart.svg";
import ProfileIcon from "../../../assets/icons/user.svg";
import "./NavMenu.css";

function NavMenu() {
  const { wishlistCount } = useContext(WishlistContext);
  const { cartCount } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { categories } = useData();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const categoryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="nav-menu">

      {/* Categories Nav Item */}
      <div
        ref={categoryRef}
        className="nav-item position-relative"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <img src={CategoryIcon} alt="Categories" />
        <span>CATEGORIES</span>

        {/* Floating Categories Dropdown List with Nested Subcategories */}
        {showDropdown && (
          <div className="category-dropdown-list" onClick={(e) => e.stopPropagation()}>
            {categories.map((cat, index) => (
              <div key={index} className="category-dropdown-item-wrapper">
                <Link
                  className="category-dropdown-item d-flex justify-content-between align-items-center"
                  to={`/products/${cat.slug}`}
                  onClick={() => setShowDropdown(false)}
                  style={{ textDecoration: "none" }}
                >
                  <span>{cat.name}</span>
                  {cat.subcategories?.length > 0 && <span className="arrow-indicator">›</span>}
                </Link>
                
                {cat.subcategories?.length > 0 && (
                  <div className="category-subcategory-flyout">
                    {cat.subcategories.map((sub, sIndex) => (
                      <Link
                        key={sIndex}
                        className="category-subcategory-item"
                        to={`/products/${cat.slug}/${sub.slug}`}
                        onClick={() => setShowDropdown(false)}
                        style={{ textDecoration: "none" }}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Deals static link */}
            <div className="category-dropdown-item-wrapper">
              <Link
                className="category-dropdown-item"
                to="/products/deals"
                onClick={() => setShowDropdown(false)}
                style={{ textDecoration: "none" }}
              >
                Deals
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Nav Item with Dynamic Notification Badge */}
      <Link to="/wishlist" className="nav-item" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="wishlist-icon-wrapper">
          <img src={WishlistIcon} alt="Wishlist" />
          {wishlistCount > 0 && (
            <span className="wishlist-badge">{wishlistCount}</span>
          )}
        </div>
        <span>WISHLIST</span>
      </Link>

      {/* Cart Nav Item with Dynamic Notification Badge */}
      <Link to="/cart" className="nav-item" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="cart-icon-wrapper">
          <img src={CartIcon} alt="Cart" />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </div>
        <span>CART</span>
      </Link>

      <Link to={user ? "/profile" : "/login"} className="nav-item" style={{ textDecoration: "none", color: "inherit" }}>
        <img src={ProfileIcon} alt="Profile" />
        <span>PROFILE</span>
      </Link>

    </div>
  );
}

export default NavMenu;
