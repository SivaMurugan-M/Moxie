import React from "react";
import { Link } from "react-router-dom";
import "./AccountDropdown.css";

/**
 * AccountDropdown
 * Small dropdown menu shown below the Profile icon when logged in.
 */
function AccountDropdown({ user, onLogout, onClose }) {

  const handleLogoutClick = (e) => {
    e.stopPropagation();
    onClose();
    onLogout();
  };

  const handleLinkClick = () => {
    onClose();
  };

  const userName = user?.name || "User";

  return (
    <div className="account-dropdown-menu" onClick={(e) => e.stopPropagation()}>
      <div className="account-dropdown-header">
        <span className="account-greeting">Hello, {userName}</span>
        {user?.email && <span className="account-email">{user.email}</span>}
      </div>

      <hr className="account-dropdown-divider" />

      <div className="account-dropdown-links">
        <Link
          to="/profile"
          className="account-dropdown-item"
          onClick={handleLinkClick}
        >
          <span className="account-item-icon">👤</span>
          <span>My Account</span>
        </Link>

        <Link
          to="/profile"
          className="account-dropdown-item"
          onClick={handleLinkClick}
        >
          <span className="account-item-icon">📦</span>
          <span>My Orders</span>
        </Link>

        <Link
          to="/wishlist"
          className="account-dropdown-item"
          onClick={handleLinkClick}
        >
          <span className="account-item-icon">❤️</span>
          <span>Wishlist</span>
        </Link>
      </div>

      <hr className="account-dropdown-divider" />

      <button
        type="button"
        className="account-dropdown-logout-btn"
        onClick={handleLogoutClick}
      >
        <span className="account-item-icon">🚪</span>
        <span>Logout</span>
      </button>
    </div>
  );
}

export default AccountDropdown;
