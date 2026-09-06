import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useModal } from "../../context/ModalContext";
import { profileService } from "../../services/profileService";
import { orderService } from "../../services/orderService";
import { addressService } from "../../services/addressService";

// Import subcomponents
import ProfileSidebar from "../../components/Profile/ProfileSidebar";
import ProfileDetails from "../../components/Profile/ProfileDetails";
import MyOrders from "../../components/Profile/MyOrders";
import OrderDetails from "../../components/Profile/OrderDetails";
import TrackOrder from "../../components/Profile/TrackOrder";
import Addresses from "../../components/Profile/Addresses";
import AccountSecurity from "../../components/Profile/AccountSecurity";

import "../../components/Profile/Profile.css";

export default function ProfilePage({ defaultTab = "profile" }) {
  const { user, logout } = useContext(AuthContext);
  const { storeSettings } = useData();
  const { openLogin } = useModal();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Data States
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update active tab when defaultTab prop changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Load user data dynamically
  useEffect(() => {
    if (!user?.email) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const prof = await profileService.fetchProfile(user.email);
        const ords = await orderService.fetchOrders(user.email);
        const addrs = await addressService.fetchAddresses(user.email);
        
        setProfile(prof);
        setOrders(ords);
        setAddresses(addrs);
      } catch (err) {
        console.error("Failed to load profile account data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Profile update handler
  const handleUpdateProfile = async (updatedData) => {
    if (!user?.email) return;
    const updated = await profileService.updateProfile(user.email, updatedData);
    setProfile(updated);
  };

  // Order actions
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setActiveTab("order-details");
  };

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setActiveTab("track-order");
  };

  const handleCancelOrder = async (orderId) => {
    if (!user?.email) return;
    const success = await orderService.cancelOrder(user.email, orderId);
    if (success) {
      const ords = await orderService.fetchOrders(user.email);
      setOrders(ords);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(ords.find((o) => o.id === orderId));
      }
    }
  };

  // Address actions
  const handleAddAddress = async (addrData) => {
    if (!user?.email) return;
    await addressService.addAddress(user.email, addrData);
    const addrs = await addressService.fetchAddresses(user.email);
    setAddresses(addrs);
  };

  const handleUpdateAddress = async (addrId, addrData) => {
    if (!user?.email) return;
    await addressService.updateAddress(user.email, addrId, addrData);
    const addrs = await addressService.fetchAddresses(user.email);
    setAddresses(addrs);
  };

  const handleDeleteAddress = async (addrId) => {
    if (!user?.email) return;
    await addressService.deleteAddress(user.email, addrId);
    const addrs = await addressService.fetchAddresses(user.email);
    setAddresses(addrs);
  };

  const handleSetDefaultAddress = async (addrId) => {
    if (!user?.email) return;
    await addressService.setDefaultAddress(user.email, addrId);
    const addrs = await addressService.fetchAddresses(user.email);
    setAddresses(addrs);
  };

  // Security actions
  const handleDeleteAccount = () => {
    // Delete profile and orders mock cache
    localStorage.removeItem(`moxie_profile_${user.email}`);
    localStorage.removeItem(`moxie_orders_${user.email}`);
    localStorage.removeItem(`moxie_addresses_${user.email}`);
    logout();
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  const renderActiveSection = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading account...</span>
          </div>
          <p className="mt-3 text-muted" style={{ fontSize: "14px" }}>Loading your account details...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "profile":
        return <ProfileDetails profile={profile} onUpdate={handleUpdateProfile} />;
      case "orders":
        return (
          <MyOrders
            orders={orders}
            storeSettings={storeSettings}
            onViewDetails={handleViewOrderDetails}
            onTrackOrder={handleTrackOrder}
            onCancelOrder={handleCancelOrder}
          />
        );
      case "order-details":
        return <OrderDetails order={selectedOrder} onBack={() => setActiveTab("orders")} />;
      case "track-order":
        return <TrackOrder order={selectedOrder} onBack={() => setActiveTab("orders")} />;
      case "addresses":
        return (
          <Addresses
            addresses={addresses}
            onAddAddress={handleAddAddress}
            onUpdateAddress={handleUpdateAddress}
            onDeleteAddress={handleDeleteAddress}
            onSetDefault={handleSetDefaultAddress}
          />
        );
      case "security":
        return <AccountSecurity profile={profile} onDeleteAccount={handleDeleteAccount} />;
      default:
        return <ProfileDetails profile={profile} onUpdate={handleUpdateProfile} />;
    }
  };

  if (!user) {
    return (
      <main className="container page-shell" style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔒</div>
        <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: "700", marginBottom: "12px" }}>Sign In to View Your Account</h2>
        <p style={{ color: "#666", marginBottom: "24px", fontSize: "15px" }}>Access your orders, track shipments, manage saved addresses and account settings.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button type="button" className="btn btn-warning rounded-pill px-4 py-2 fw-bold" onClick={openLogin}>Sign In</button>
          <Link to="/register" className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold">Create Account</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page-container container page-shell">
      {/* Mobile Select Tab Navigation */}
      <div className="profile-mobile-nav">
        <select
          className="profile-mobile-select"
          value={activeTab === "order-details" || activeTab === "track-order" ? "orders" : activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <option value="profile">👤 My Profile</option>
          <option value="orders">📦 My Orders</option>
          <option value="addresses">📍 My Addresses</option>
          <option value="security">🔒 Account & Security</option>
        </select>
      </div>

      <div className="profile-layout-grid">
        <ProfileSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          onLogout={handleLogout}
        />
        <div className="profile-content-card">
          {renderActiveSection()}
        </div>
      </div>
    </main>
  );
}
