import React from "react";

export default function ProfileSidebar({ activeTab, setActiveTab, profile, onLogout }) {
  const menuItems = [
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "orders", label: "My Orders", icon: "📦" },
    { id: "addresses", label: "My Addresses", icon: "📍" },
    { id: "security", label: "Account & Security", icon: "🔒" },
  ];

  return (
    <aside className="profile-sidebar-card">
      {profile && (
        <div className="profile-user-summary">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="profile-summary-avatar"
          />
          <h3 className="profile-summary-name">{profile.name}</h3>
          <p className="profile-summary-email">{profile.email}</p>
        </div>
      )}

      <nav className="profile-menu-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`profile-menu-btn ${activeTab === item.id || (item.id === "orders" && (activeTab === "order-details" || activeTab === "track-order")) ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        
        <button
          className="profile-menu-btn profile-menu-btn-logout"
          onClick={onLogout}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
