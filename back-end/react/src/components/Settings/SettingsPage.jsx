import React, { useState, useEffect, useRef } from 'react';
import CustomSelect from '../Common/CustomSelect';
import { AppIcon, SettingsIcon, StoreIcon, UserIcon, LockIcon, OrderIcon, ShippingIcon, ReceiptIcon, PaymentIcon, NotificationIcon, SecurityIcon, EditIcon, ViewIcon, ViewOffSlashIcon } from '../../icons';
import './SettingsPage.css';


export default function SettingsPage() {
  const djangoContext = window.DJANGO_CONTEXT || {};

  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Files for upload
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const logoInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Store Settings Form State
  const initialSettings = {
    // 1. General
    store_name: 'Moxie',
    store_logo: null,
    store_email: 'support@moxie.com',
    store_phone: '+91 9876543210',
    store_address: '123 Moxie Studio, Tech Park, Chennai, Tamil Nadu',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '600001',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    store_description: 'Moxie E-Commerce - Premium Lifestyle & Fashion Products',
    website_url: 'https://moxie.com',

    // 2. Store Operation
    store_status: 'Open',
    maintenance_mode: false,
    allow_registration: true,
    allow_guest_browsing: true,
    allow_guest_checkout: true,
    require_login_before_checkout: true,
    allow_reviews: true,
    allow_wishlist: true,
    enable_product_search: true,
    enable_stock_management: true,
    low_stock_alert: true,
    min_stock_threshold: 5,

    // 3. Order
    order_prefix: 'MOX',
    min_order_amount: 0,
    max_order_amount: 100000,
    auto_confirm_orders: true,
    allow_order_cancellation: true,
    cancellation_time_limit: '24 Hours',
    allow_order_modification: false,
    order_auto_cancel_time: '48 Hours',
    enable_order_tracking: true,
    enable_order_notifications: true,
    allow_returns: true,

    // 4. Shipping
    enable_shipping: true,
    free_shipping: true,
    free_shipping_min_amount: 999,
    default_shipping_charge: 100,
    express_shipping_charge: 200,
    processing_time: '1-3 Days',
    delivery_estimate: '3-7 Days',
    express_delivery_days: '1-2 Days',
    shipping_provider: 'Delhivery / Bluedart',
    cod_available: true,
    delivery_area: 'All India (Pan India)',

    // 5. Tax
    enable_tax: false,
    tax_type: 'GST',
    tax_rate: 18,
    tax_included: true,
    gst_number: '33AAAAA0000A1Z5',
    tax_name: 'GST (Goods & Services Tax)',

    // 6. Payment
    payment: {
      provider: 'Razorpay',
      mode: 'Test',
      razorpay_key_id: 'rzp_test_************',
      online_payment_enabled: true,
      razorpay_enabled: true,
      cod_enabled: true,
      payment_currency: 'INR',
      payment_timeout: '15 Minutes'
    },

    // 7. Notifications & Email
    email_notifications_enabled: true,
    notify_order_created: true,
    notify_order_confirmed: true,
    notify_payment_success: true,
    notify_order_shipped: true,
    notify_order_delivered: true,
    notify_order_cancelled: true,
    notify_new_customer: true,
    notify_low_stock: true,
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: 'support@moxie.com',
    smtp_from_email: 'noreply@moxie.com',

    // 8. Security
    security: {
      session_timeout: '30 Minutes',
      require_admin_auth: true,
      allow_admin_login: true,
      login_protection: true,
      failed_login_attempts: '5 Max Attempts'
    },

    // 9. System
    system: {
      maintenance_mode: false,
      debug_mode: false,
      api_status: 'Connected',
      database_status: 'Connected',
      payment_status: 'Connected',
      email_status: 'Connected',
      backend_server_status: 'Online (Operational)',
      frontend_status: 'Connected (Port 3000 / Vite)',
      django_version: '5.x',
      app_version: 'v2.4.0 (Build 2026)'
    }
  };

  const [settingsData, setSettingsData] = useState(initialSettings);
  const [originalSettings, setOriginalSettings] = useState(initialSettings);

  // Admin Profile Form State
  const initialProfile = {
    first_name: djangoContext.adminInfo?.firstName || '',
    last_name: djangoContext.adminInfo?.lastName || '',
    email: djangoContext.adminInfo?.email || '',
    username: djangoContext.adminInfo?.username || '',
    mobile: djangoContext.adminInfo?.mobile || '',
    profile_image: djangoContext.adminInfo?.profileImage || null,
    date_joined: djangoContext.adminInfo?.dateJoined || '—',
    last_login: djangoContext.adminInfo?.lastLogin || '—'
  };

  const [adminProfile, setAdminProfile] = useState(initialProfile);
  const [originalProfile, setOriginalProfile] = useState(initialProfile);

  // Change Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [testEmailSending, setTestEmailSending] = useState(false);
  const [refreshingHealth, setRefreshingHealth] = useState(false);

  // Fetch settings from API
  const fetchSettings = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshingHealth(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/admin-settings/', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const merged = {
          ...settingsData,
          ...data.general,
          ...data.store_operation,
          ...data.order,
          ...data.shipping,
          ...data.tax,
          ...data.notifications,
          payment: { ...settingsData.payment, ...(data.payment || {}) },
          security: { ...settingsData.security, ...(data.security || {}) },
          system: { ...settingsData.system, ...(data.system || {}) }
        };
        setSettingsData(merged);
        setOriginalSettings(merged);
        if (data.general?.store_logo) {
          setLogoPreview(data.general.store_logo);
        }
        if (isManualRefresh) {
          setMessage({ type: 'success', text: 'System diagnostics refreshed successfully.' });
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      if (isManualRefresh) {
        setMessage({ type: 'error', text: 'Failed to refresh system status.' });
      }
    } finally {
      setLoading(false);
      setRefreshingHealth(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (field, value) => {
    setSettingsData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setSettingsData(prev => ({
      ...prev,
      payment: { ...prev.payment, [field]: value }
    }));
  };

  const handleToggleChange = (field) => {
    if (!isEditing) return;
    setSettingsData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePaymentToggle = (field) => {
    if (!isEditing) return;
    setSettingsData(prev => ({
      ...prev,
      payment: { ...prev.payment, [field]: !prev.payment[field] }
    }));
  };

  // Logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let bodyData;
      let headers = {
        'X-CSRFToken': djangoContext.csrfToken || ''
      };

      if (logoFile) {
        bodyData = new FormData();
        bodyData.append('store_logo', logoFile);
        Object.keys(settingsData).forEach(key => {
          if (key === 'payment') {
            Object.keys(settingsData.payment).forEach(pk => {
              bodyData.append(pk, settingsData.payment[pk]);
            });
          } else if (key !== 'security' && key !== 'system') {
            bodyData.append(key, settingsData[key]);
          }
        });
      } else {
        headers['Content-Type'] = 'application/json';
        bodyData = JSON.stringify({
          ...settingsData,
          ...settingsData.payment
        });
      }

      const res = await fetch('/api/admin-settings/', {
        method: 'PATCH',
        headers: headers,
        body: bodyData
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Settings updated and saved to database successfully.' });
        setOriginalSettings(settingsData);
        setIsEditing(false);
        setLogoFile(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update settings.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  // Save Admin Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let bodyData;
      let headers = {
        'X-CSRFToken': djangoContext.csrfToken || ''
      };

      if (avatarFile) {
        bodyData = new FormData();
        bodyData.append('profile_image', avatarFile);
        bodyData.append('first_name', adminProfile.first_name);
        bodyData.append('last_name', adminProfile.last_name);
        bodyData.append('email', adminProfile.email);
        bodyData.append('username', adminProfile.username);
        bodyData.append('mobile', adminProfile.mobile);
      } else {
        headers['Content-Type'] = 'application/json';
        bodyData = JSON.stringify(adminProfile);
      }

      const res = await fetch('/api/admin-settings/profile/', {
        method: 'PATCH',
        headers: headers,
        body: bodyData
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Admin profile updated in database successfully.' });
        if (data.profile) {
          setAdminProfile(prev => ({ ...prev, ...data.profile }));
          setOriginalProfile(prev => ({ ...prev, ...data.profile }));
          if (data.profile.profile_image) {
            setAvatarPreview(data.profile.profile_image);
          }
        } else {
          setOriginalProfile(adminProfile);
        }
        setIsEditing(false);
        setAvatarFile(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating admin profile.' });
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Please fill out all password fields.' });
      return;
    }
    if (passwordData.new_password === passwordData.current_password) {
      setMessage({ type: 'error', text: 'New password must be different from current password.' });
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }
    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (!/[A-Za-z]/.test(passwordData.new_password) || !/\d/.test(passwordData.new_password)) {
      setMessage({ type: 'error', text: 'New password must contain both letters and numbers.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin-settings/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': djangoContext.csrfToken || ''
        },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Password changed successfully and updated in database.' });
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error changing password.' });
    } finally {
      setSaving(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    setTestEmailSending(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin-settings/test-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': djangoContext.csrfToken || ''
        },
        body: JSON.stringify({ email: settingsData.store_email })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Test email dispatched successfully.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Unable to send test email.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error sending test email.' });
    } finally {
      setTestEmailSending(false);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setSettingsData(originalSettings);
    setAdminProfile(originalProfile);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    setIsEditing(false);
    setLogoFile(null);
    setAvatarFile(null);
    setLogoPreview(originalSettings.store_logo || null);
    setAvatarPreview(originalProfile.profile_image || null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="settings-shell">
      {/* Header */}
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your Moxie e-commerce website settings and admin preferences.</p>
      </div>

      {/* Grid Layout */}
      <div className="settings-grid-layout">
        {/* Sidebar Nav */}
        <div className="settings-nav-card">
          <button className={`nav-tab-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => handleTabSwitch('general')}>
            <AppIcon icon={SettingsIcon} size={18} />
            General
          </button>

          <button className={`nav-tab-item ${activeTab === 'store' ? 'active' : ''}`} onClick={() => handleTabSwitch('store')}>
            <AppIcon icon={StoreIcon} size={18} />
            Store Operations
          </button>

          <button className={`nav-tab-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => handleTabSwitch('account')}>
            <AppIcon icon={UserIcon} size={18} />
            Admin Account
          </button>

          <button className={`nav-tab-item ${activeTab === 'password' ? 'active' : ''}`} onClick={() => handleTabSwitch('password')}>
            <AppIcon icon={LockIcon} size={18} />
            Change Password
          </button>

          <button className={`nav-tab-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabSwitch('orders')}>
            <AppIcon icon={OrderIcon} size={18} />
            Order Settings
          </button>

          <button className={`nav-tab-item ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => handleTabSwitch('shipping')}>
            <AppIcon icon={ShippingIcon} size={18} />
            Shipping Settings
          </button>

          <button className={`nav-tab-item ${activeTab === 'tax' ? 'active' : ''}`} onClick={() => handleTabSwitch('tax')}>
            <AppIcon icon={ReceiptIcon} size={18} />
            Tax Settings
          </button>

          <button className={`nav-tab-item ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => handleTabSwitch('payment')}>
            <AppIcon icon={PaymentIcon} size={18} />
            Payment Settings
          </button>

          <button className={`nav-tab-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => handleTabSwitch('notifications')}>
            <AppIcon icon={NotificationIcon} size={18} />
            Notifications & Email
          </button>

          <button className={`nav-tab-item ${activeTab === 'system' ? 'active' : ''}`} onClick={() => handleTabSwitch('system')}>
            <AppIcon icon={SecurityIcon} size={18} />
            Security & System
          </button>
        </div>


        {/* Content Panel */}
        <div className="settings-panel-card">
          {message.text && (
            <div className={`settings-banner ${message.type}`}>
              <span>{message.text}</span>
            </div>
          )}

          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>GENERAL SETTINGS</h2>
                  <p>Configure basic store details, contact information, currency, and timezone.</p>
                </div>
                {!isEditing && (
                  <button className="btn-edit-settings" onClick={() => setIsEditing(true)}>
                    <AppIcon icon={EditIcon} size={15} />
                    Edit
                  </button>
                )}
              </div>

              {/* Logo Preview & Upload */}
              <div className="form-field-group full-width" style={{ marginBottom: '18px' }}>
                <label>Store Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '6px' }}>
                  {logoPreview ? (
                    <div style={{ width: '80px', height: '80px', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                      <img src={logoPreview} alt="Store Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '10px', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '11px', textAlign: 'center', padding: '6px', background: '#f8fafc' }}>
                      No Logo
                    </div>
                  )}
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
                      >
                        📁 Choose New Logo
                      </button>
                      <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#64748b' }}>Recommended: PNG or JPG (transparent background, max 2MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="form-field-group">
                  <label>Store Name</label>
                  <input type="text" disabled={!isEditing} value={settingsData.store_name} onChange={(e) => handleInputChange('store_name', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Store Email</label>
                  <input type="email" disabled={!isEditing} value={settingsData.store_email} onChange={(e) => handleInputChange('store_email', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Store Phone</label>
                  <input type="text" disabled={!isEditing} value={settingsData.store_phone} onChange={(e) => handleInputChange('store_phone', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Website URL</label>
                  <input type="url" disabled={!isEditing} value={settingsData.website_url} onChange={(e) => handleInputChange('website_url', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>City</label>
                  <input type="text" disabled={!isEditing} value={settingsData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>State</label>
                  <input type="text" disabled={!isEditing} value={settingsData.state} onChange={(e) => handleInputChange('state', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Country</label>
                  <input type="text" disabled={!isEditing} value={settingsData.country} onChange={(e) => handleInputChange('country', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Pincode / Postal Code</label>
                  <input type="text" disabled={!isEditing} value={settingsData.pincode} onChange={(e) => handleInputChange('pincode', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Currency</label>
                  <CustomSelect
                    disabled={!isEditing}
                    value={settingsData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    options={[
                      { value: 'INR', label: 'INR (₹)' },
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'GBP', label: 'GBP (£)' }
                    ]}
                    width="100%"
                    height="42px"
                  />
                </div>

                <div className="form-field-group">
                  <label>Timezone</label>
                  <CustomSelect
                    disabled={!isEditing}
                    value={settingsData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    options={[
                      { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' },
                      { value: 'UTC', label: 'UTC (GMT +0:00)' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                      { value: 'Europe/London', label: 'Europe/London (BST)' },
                      { value: 'Asia/Dubai', label: 'Asia/Dubai (GST +4:00)' }
                    ]}
                    width="100%"
                    height="42px"
                  />
                </div>

                <div className="form-field-group full-width">
                  <label>Store Address</label>
                  <textarea disabled={!isEditing} value={settingsData.store_address} onChange={(e) => handleInputChange('store_address', e.target.value)} />
                </div>

                <div className="form-field-group full-width">
                  <label>Store Description</label>
                  <textarea disabled={!isEditing} value={settingsData.store_description} onChange={(e) => handleInputChange('store_description', e.target.value)} />
                </div>
              </div>

              {isEditing && (
                <div className="form-actions-bar">
                  <button className="btn-save-settings" disabled={saving} onClick={handleSaveSettings}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-settings" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STORE OPERATIONS */}
          {activeTab === 'store' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>STORE OPERATIONS</h2>
                  <p>Manage store availability, customer registration, guest browsing, and features.</p>
                </div>
                {!isEditing && (
                  <button className="btn-edit-settings" onClick={() => setIsEditing(true)}>
                    <AppIcon icon={EditIcon} size={15} />
                    Edit
                  </button>
                )}
              </div>

              <div className="settings-form-grid" style={{ marginBottom: '18px' }}>
                <div className="form-field-group">
                  <label>Store Status</label>
                  <CustomSelect
                    disabled={!isEditing}
                    value={settingsData.store_status}
                    onChange={(e) => handleInputChange('store_status', e.target.value)}
                    options={[
                      { value: 'Open', label: '● Open (Operational)' },
                      { value: 'Maintenance', label: '○ Maintenance Mode' }
                    ]}
                    width="100%"
                    height="42px"
                  />
                </div>

                <div className="form-field-group">
                  <label>Minimum Stock Threshold</label>
                  <input type="number" disabled={!isEditing} value={settingsData.min_stock_threshold} onChange={(e) => handleInputChange('min_stock_threshold', e.target.value)} />
                </div>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Maintenance Mode</span>
                  <small>Temporarily show maintenance notice to public visitors</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.maintenance_mode} onChange={() => handleToggleChange('maintenance_mode')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Allow Customer Registration</span>
                  <small>Enable new customer sign ups on the front-end website</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.allow_registration} onChange={() => handleToggleChange('allow_registration')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Allow Guest Browsing</span>
                  <small>Allow guests to view products, search, and add to cart without logging in</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.allow_guest_browsing} onChange={() => handleToggleChange('allow_guest_browsing')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Allow Guest Checkout</span>
                  <small>Allow customers to complete checkout without creating an account</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.allow_guest_checkout} onChange={() => handleToggleChange('allow_guest_checkout')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Require Login Before Checkout</span>
                  <small>Enforce login requirement before completing purchases or payments</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.require_login_before_checkout} onChange={() => handleToggleChange('require_login_before_checkout')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Allow Product Reviews</span>
                  <small>Enable product reviews and rating submissions from customers</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.allow_reviews} onChange={() => handleToggleChange('allow_reviews')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Allow Wishlist</span>
                  <small>Enable customer wishlist functionality</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.allow_wishlist} onChange={() => handleToggleChange('allow_wishlist')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Stock Management Enabled</span>
                  <small>Automatically decrement stock inventory upon completed orders</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.enable_stock_management} onChange={() => handleToggleChange('enable_stock_management')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Low Stock Alert</span>
                  <small>Trigger notifications when product inventory falls below threshold</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.low_stock_alert} onChange={() => handleToggleChange('low_stock_alert')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              {isEditing && (
                <div className="form-actions-bar">
                  <button className="btn-save-settings" disabled={saving} onClick={handleSaveSettings}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-settings" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN ACCOUNT */}
          {activeTab === 'account' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>ADMIN ACCOUNT PROFILE</h2>
                  <p>Update your administrator profile details.</p>
                </div>
                {!isEditing && (
                  <button className="btn-edit-settings" onClick={() => setIsEditing(true)}>
                    <AppIcon icon={EditIcon} size={15} />
                    Edit
                  </button>
                )}
              </div>

              {/* Profile Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid #e0e7ff' }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Admin Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (adminProfile.first_name || adminProfile.username || 'A')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a' }}>{adminProfile.first_name ? `${adminProfile.first_name} ${adminProfile.last_name}` : adminProfile.username}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Administrator Account</span>
                  {isEditing && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
                      >
                        📷 Change Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="form-field-group">
                  <label>First Name</label>
                  <input type="text" disabled={!isEditing} value={adminProfile.first_name} onChange={(e) => setAdminProfile({ ...adminProfile, first_name: e.target.value })} />
                </div>

                <div className="form-field-group">
                  <label>Last Name</label>
                  <input type="text" disabled={!isEditing} value={adminProfile.last_name} onChange={(e) => setAdminProfile({ ...adminProfile, last_name: e.target.value })} />
                </div>

                <div className="form-field-group">
                  <label>Email Address</label>
                  <input type="email" disabled={!isEditing} value={adminProfile.email} onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })} />
                </div>

                <div className="form-field-group">
                  <label>Username</label>
                  <input type="text" disabled={!isEditing} value={adminProfile.username} onChange={(e) => setAdminProfile({ ...adminProfile, username: e.target.value })} />
                </div>

                <div className="form-field-group">
                  <label>Mobile Number</label>
                  <input type="text" disabled={!isEditing} value={adminProfile.mobile} onChange={(e) => setAdminProfile({ ...adminProfile, mobile: e.target.value })} />
                </div>

                <div className="form-field-group">
                  <label>Account Created Date</label>
                  <input type="text" disabled value={adminProfile.date_joined} />
                </div>

                <div className="form-field-group full-width">
                  <label>Last Login</label>
                  <input type="text" disabled value={adminProfile.last_login} />
                </div>
              </div>

              {isEditing && (
                <div className="form-actions-bar">
                  <button className="btn-save-settings" disabled={saving} onClick={handleSaveProfile}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button className="btn-cancel-settings" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>CHANGE PASSWORD</h2>
                  <p>Securely change your admin password.</p>
                </div>
                {!isEditing && (
                  <button className="btn-edit-settings" onClick={() => setIsEditing(true)}>
                    <AppIcon icon={EditIcon} size={15} />
                    Edit
                  </button>
                )}
              </div>

              <div className="settings-form-grid full">
                <div className="form-field-group">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      disabled={!isEditing}
                      value={passwordData.current_password}
                      placeholder="••••••••"
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      title={showCurrentPw ? "Hide Password" : "Show Password"}
                    >
                      {showCurrentPw ? (
                        <AppIcon icon={ViewOffSlashIcon} size={18} />
                      ) : (
                        <AppIcon icon={ViewIcon} size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-field-group">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPw ? "text" : "password"}
                      disabled={!isEditing}
                      value={passwordData.new_password}
                      placeholder="••••••••"
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPw(!showNewPw)}
                      title={showNewPw ? "Hide Password" : "Show Password"}
                    >
                      {showNewPw ? (
                        <AppIcon icon={ViewOffSlashIcon} size={18} />
                      ) : (
                        <AppIcon icon={ViewIcon} size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-field-group">
                  <label>Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      disabled={!isEditing}
                      value={passwordData.confirm_password}
                      placeholder="••••••••"
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      title={showConfirmPw ? "Hide Password" : "Show Password"}
                    >
                      {showConfirmPw ? (
                        <AppIcon icon={ViewOffSlashIcon} size={18} />
                      ) : (
                        <AppIcon icon={ViewIcon} size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="form-actions-bar">
                  <button className="btn-save-settings" disabled={saving} onClick={handleChangePassword}>
                    {saving ? 'Updating...' : 'Change Password'}
                  </button>
                  <button className="btn-cancel-settings" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ORDER SETTINGS */}
          {activeTab === 'orders' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>ORDER SETTINGS</h2>
                  <p>Configure order prefixes, limits, cancellations, and returns.</p>
                </div>
                {!isEditing && (
                  <button className="btn-edit-settings" onClick={() => setIsEditing(true)}>
                    <AppIcon icon={EditIcon} size={15} />
                    Edit
                  </button>
                )}
              </div>

              <div className="settings-form-grid">
                <div className="form-field-group">
                  <label>Order Prefix</label>
                  <input type="text" disabled={!isEditing} value={settingsData.order_prefix} onChange={(e) => handleInputChange('order_prefix', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Cancellation Time Limit</label>
                  <input type="text" disabled={!isEditing} value={settingsData.cancellation_time_limit} onChange={(e) => handleInputChange('cancellation_time_limit', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Minimum Order Amount (₹)</label>
                  <input type="number" disabled={!isEditing} value={settingsData.min_order_amount} onChange={(e) => handleInputChange('min_order_amount', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Maximum Order Amount (₹)</label>
                  <input type="number" disabled={!isEditing} value={settingsData.max_order_amount} onChange={(e) => handleInputChange('max_order_amount', e.target.value)} />
                </div>

                <div className="form-field-group full-width">
                  <label>Order Auto-Cancel Time (Unpaid)</label>
                  <input type="text" disabled={!isEditing} value={settingsData.order_auto_cancel_time} onChange={(e) => handleInputChange('order_auto_cancel_time', e.target.value)} />
                </div>
              </div>

              <div className="toggle-switch-row" style={{ marginTop: '16px' }}>
                <div className="toggle-label-box">
                  <span>Auto Confirm Orders</span>
                  <small>Automatically mark valid placed orders as Confirmed</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.auto_confirm_orders} onChange={() => handleToggleChange('auto_confirm_orders')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Allow Order Cancellation</span>
                  <small>Allow customers and admins to cancel pending orders</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.allow_order_cancellation} onChange={() => handleToggleChange('allow_order_cancellation')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Allow Order Modification</span>
                  <small>Permit customers to edit shipping addresses before shipment</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.allow_order_modification} onChange={() => handleToggleChange('allow_order_modification')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Enable Order Tracking</span>
                  <small>Provide real-time step-by-step order tracking progress on customer frontend</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.enable_order_tracking} onChange={() => handleToggleChange('enable_order_tracking')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Allow Product Returns</span>
                  <small>Enable return request workflow for delivered orders within policy window</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.allow_returns} onChange={() => handleToggleChange('allow_returns')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              {isEditing && (
                <div className="form-actions-bar">
                  <button className="btn-save-settings" disabled={saving} onClick={handleSaveSettings}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-settings" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SHIPPING SETTINGS */}
          {activeTab === 'shipping' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>SHIPPING SETTINGS</h2>
                  <p>Set delivery charges, free shipping thresholds, and estimated timelines.</p>
                </div>
                {!isEditing && (
                  <button className="btn-edit-settings" onClick={() => setIsEditing(true)}>
                    <AppIcon icon={EditIcon} size={15} />
                    Edit
                  </button>
                )}
              </div>

              <div className="settings-form-grid">
                <div className="form-field-group">
                  <label>Default Shipping Charge (₹)</label>
                  <input type="number" disabled={!isEditing} value={settingsData.default_shipping_charge} onChange={(e) => handleInputChange('default_shipping_charge', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Express Shipping Charge (₹)</label>
                  <input type="number" disabled={!isEditing} value={settingsData.express_shipping_charge} onChange={(e) => handleInputChange('express_shipping_charge', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Free Shipping Minimum Amount (₹)</label>
                  <input type="number" disabled={!isEditing} value={settingsData.free_shipping_min_amount} onChange={(e) => handleInputChange('free_shipping_min_amount', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Shipping Provider</label>
                  <input type="text" disabled={!isEditing} value={settingsData.shipping_provider} onChange={(e) => handleInputChange('shipping_provider', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Processing Time</label>
                  <input type="text" disabled={!isEditing} value={settingsData.processing_time} onChange={(e) => handleInputChange('processing_time', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Standard Delivery Estimate</label>
                  <input type="text" disabled={!isEditing} value={settingsData.delivery_estimate} onChange={(e) => handleInputChange('delivery_estimate', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Express Delivery Estimate</label>
                  <input type="text" disabled={!isEditing} value={settingsData.express_delivery_days} onChange={(e) => handleInputChange('express_delivery_days', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Delivery Area / Region</label>
                  <input type="text" disabled={!isEditing} value={settingsData.delivery_area} onChange={(e) => handleInputChange('delivery_area', e.target.value)} />
                </div>
              </div>

              <div className="toggle-switch-row" style={{ marginTop: '16px' }}>
                <div className="toggle-label-box">
                  <span>Enable Shipping Module</span>
                  <small>Enable delivery calculations for store checkout</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.enable_shipping} onChange={() => handleToggleChange('enable_shipping')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Enable Free Shipping Promo</span>
                  <small>Offer free standard delivery when cart subtotal meets or exceeds threshold</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.free_shipping} onChange={() => handleToggleChange('free_shipping')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Cash on Delivery (COD) Available</span>
                  <small>Allow customers to choose Cash on Delivery option during checkout</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.cod_available} onChange={() => handleToggleChange('cod_available')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              {isEditing && (
                <div className="form-actions-bar">
                  <button className="btn-save-settings" disabled={saving} onClick={handleSaveSettings}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-settings" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TAX SETTINGS */}
          {activeTab === 'tax' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>TAX SETTINGS</h2>
                  <p>Configure GST / Tax percentages and price inclusion rules.</p>
                </div>
                {!isEditing && (
                  <button className="btn-edit-settings" onClick={() => setIsEditing(true)}>
                    <AppIcon icon={EditIcon} size={15} />
                    Edit
                  </button>
                )}
              </div>

              <div className="settings-form-grid">
                <div className="form-field-group">
                  <label>Tax Name</label>
                  <input type="text" disabled={!isEditing} value={settingsData.tax_name} onChange={(e) => handleInputChange('tax_name', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>Tax Type</label>
                  <CustomSelect
                    disabled={!isEditing}
                    value={settingsData.tax_type}
                    onChange={(e) => handleInputChange('tax_type', e.target.value)}
                    options={[
                      { value: 'GST', label: 'GST (Goods and Services Tax)' },
                      { value: 'VAT', label: 'VAT (Value Added Tax)' },
                      { value: 'Sales Tax', label: 'Sales Tax' }
                    ]}
                    width="100%"
                    height="42px"
                  />
                </div>

                <div className="form-field-group">
                  <label>Tax Rate (%)</label>
                  <input type="number" disabled={!isEditing} value={settingsData.tax_rate} onChange={(e) => handleInputChange('tax_rate', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>GST / Tax Registration Number</label>
                  <input type="text" disabled={!isEditing} value={settingsData.gst_number} onChange={(e) => handleInputChange('gst_number', e.target.value)} />
                </div>
              </div>

              <div className="toggle-switch-row" style={{ marginTop: '16px' }}>
                <div className="toggle-label-box">
                  <span>Enable Tax Calculation</span>
                  <small>Calculate tax and display breakdown in order invoice</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.enable_tax} onChange={() => handleToggleChange('enable_tax')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Tax Included in Product Prices</span>
                  <small>Display prices inclusive of all applicable taxes on storefront</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.tax_included} onChange={() => handleToggleChange('tax_included')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              {isEditing && (
                <div className="form-actions-bar">
                  <button className="btn-save-settings" disabled={saving} onClick={handleSaveSettings}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-settings" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: PAYMENT SETTINGS */}
          {activeTab === 'payment' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>PAYMENT GATEWAY CONFIGURATION</h2>
                  <p>Razorpay integration and online payment settings.</p>
                </div>
                {!isEditing && (
                  <button className="btn-edit-settings" onClick={() => setIsEditing(true)}>
                    <AppIcon icon={EditIcon} size={15} />
                    Edit
                  </button>
                )}
              </div>

              <div className="settings-form-grid">
                <div className="form-field-group">
                  <label>Payment Provider</label>
                  <input type="text" value={settingsData.payment.provider} disabled />
                </div>

                <div className="form-field-group">
                  <label>Payment Mode</label>
                  <CustomSelect
                    disabled={!isEditing}
                    value={settingsData.payment.mode}
                    onChange={(e) => handlePaymentChange('mode', e.target.value)}
                    options={[
                      { value: 'Test', label: 'Test Mode (Sandbox)' },
                      { value: 'Live', label: 'Live Mode (Production)' }
                    ]}
                    width="100%"
                    height="42px"
                  />
                </div>

                <div className="form-field-group">
                  <label>Payment Currency</label>
                  <CustomSelect
                    disabled={!isEditing}
                    value={settingsData.payment.payment_currency}
                    onChange={(e) => handlePaymentChange('payment_currency', e.target.value)}
                    options={[
                      { value: 'INR', label: 'INR (₹)' },
                      { value: 'USD', label: 'USD ($)' }
                    ]}
                    width="100%"
                    height="42px"
                  />
                </div>

                <div className="form-field-group">
                  <label>Payment Session Timeout</label>
                  <input type="text" disabled={!isEditing} value={settingsData.payment.payment_timeout} onChange={(e) => handlePaymentChange('payment_timeout', e.target.value)} />
                </div>

                <div className="form-field-group full-width">
                  <label>Razorpay Key ID</label>
                  <input type="text" value={settingsData.payment.razorpay_key_id} disabled />
                  <small style={{ color: '#64748b', fontSize: '11.5px', marginTop: '4px' }}>
                    🔐 Payment secrets are securely stored in server environment variables (.env).
                  </small>
                </div>
              </div>

              <div className="toggle-switch-row" style={{ marginTop: '16px' }}>
                <div className="toggle-label-box">
                  <span>Online Payment (Razorpay) Enabled</span>
                  <small>Accept Cards, UPI, Netbanking, and Wallets via Razorpay</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.payment.online_payment_enabled} onChange={() => handlePaymentToggle('online_payment_enabled')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Cash on Delivery (COD) Enabled</span>
                  <small>Accept cash payments upon delivery at customer doorstep</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.payment.cod_enabled} onChange={() => handlePaymentToggle('cod_enabled')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              {isEditing && (
                <div className="form-actions-bar">
                  <button className="btn-save-settings" disabled={saving} onClick={handleSaveSettings}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-settings" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: NOTIFICATIONS & EMAIL */}
          {activeTab === 'notifications' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>NOTIFICATIONS & EMAIL</h2>
                  <p>Configure automated system notifications and test email delivery.</p>
                </div>
                {!isEditing && (
                  <button className="btn-edit-settings" onClick={() => setIsEditing(true)}>
                    <AppIcon icon={EditIcon} size={15} />
                    Edit
                  </button>
                )}
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Email Notifications Master Switch</span>
                  <small>Enable or disable all outgoing automated transactional emails</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.email_notifications_enabled} onChange={() => handleToggleChange('email_notifications_enabled')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Notify on New Order Created</span>
                  <small>Send instant notification to admin when an order is submitted</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.notify_order_created} onChange={() => handleToggleChange('notify_order_created')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Notify on Order Confirmed</span>
                  <small>Send confirmation receipt email to customer</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.notify_order_confirmed} onChange={() => handleToggleChange('notify_order_confirmed')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Notify on Payment Success</span>
                  <small>Send notifications upon Razorpay payment confirmation</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.notify_payment_success} onChange={() => handleToggleChange('notify_payment_success')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Notify on Order Shipped</span>
                  <small>Notify customer with courier tracking details when order is dispatched</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.notify_order_shipped} onChange={() => handleToggleChange('notify_order_shipped')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Notify on Order Delivered</span>
                  <small>Send delivery confirmation and review request email to customer</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.notify_order_delivered} onChange={() => handleToggleChange('notify_order_delivered')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Notify on Order Cancelled</span>
                  <small>Send cancellation summary and refund notices</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.notify_order_cancelled} onChange={() => handleToggleChange('notify_order_cancelled')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Notify on New Customer Sign-Up</span>
                  <small>Notify store administrator when a new customer registers</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.notify_new_customer} onChange={() => handleToggleChange('notify_new_customer')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-switch-row">
                <div className="toggle-label-box">
                  <span>Low Stock Alert Notification</span>
                  <small>Send admin warning email when inventory drops below threshold</small>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" disabled={!isEditing} checked={settingsData.notify_low_stock} onChange={() => handleToggleChange('notify_low_stock')} />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="settings-form-grid" style={{ marginTop: '20px' }}>
                <div className="form-field-group">
                  <label>SMTP Host</label>
                  <input type="text" disabled={!isEditing} value={settingsData.smtp_host} onChange={(e) => handleInputChange('smtp_host', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>SMTP Port</label>
                  <input type="number" disabled={!isEditing} value={settingsData.smtp_port} onChange={(e) => handleInputChange('smtp_port', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>SMTP Username / From Email</label>
                  <input type="email" disabled={!isEditing} value={settingsData.smtp_from_email} onChange={(e) => handleInputChange('smtp_from_email', e.target.value)} />
                </div>

                <div className="form-field-group">
                  <label>SMTP Password</label>
                  <input type="password" value="************************" disabled />
                </div>
              </div>

              {isEditing ? (
                <div className="form-actions-bar" style={{ marginTop: '20px' }}>
                  <button className="btn-secondary-action" disabled={testEmailSending} onClick={handleSendTestEmail}>
                    {testEmailSending ? 'Sending Test Email...' : '✉️ Send Test Email'}
                  </button>
                  <button className="btn-save-settings" disabled={saving} onClick={handleSaveSettings}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-settings" onClick={handleCancel}>Cancel</button>
                </div>
              ) : (
                <div className="form-actions-bar" style={{ marginTop: '20px' }}>
                  <button className="btn-secondary-action" disabled={testEmailSending} onClick={handleSendTestEmail}>
                    {testEmailSending ? 'Sending Test Email...' : '✉️ Send Test Email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 10: SECURITY & SYSTEM */}
          {activeTab === 'system' && (
            <div>
              <div className="panel-header-box flex-between">
                <div>
                  <h2>SECURITY & SYSTEM STATUS</h2>
                  <p>Real-time system health monitoring and security parameters.</p>
                </div>
                <button
                  className="btn-secondary-action"
                  disabled={refreshingHealth}
                  onClick={() => fetchSettings(true)}
                  style={{ height: '36px', fontSize: '12.5px', gap: '6px' }}
                >
                  {refreshingHealth ? 'Checking Health...' : '🔄 Refresh Status'}
                </button>
              </div>

              <div className="system-status-grid">
                <div className="status-indicator-card">
                  <span>Django REST APIs</span>
                  <span className="badge-status-ok">{settingsData.system?.api_status || 'Connected'}</span>
                </div>

                <div className="status-indicator-card">
                  <span>SQLite Database</span>
                  <span className="badge-status-ok">{settingsData.system?.database_status || 'Connected'}</span>
                </div>

                <div className="status-indicator-card">
                  <span>Razorpay Payment Gateway</span>
                  <span className="badge-status-ok">{settingsData.system?.payment_status || 'Connected'}</span>
                </div>

                <div className="status-indicator-card">
                  <span>Email Engine</span>
                  <span className="badge-status-ok">{settingsData.system?.email_status || 'Connected'}</span>
                </div>

                <div className="status-indicator-card">
                  <span>Backend Server Status</span>
                  <span className="badge-status-ok">{settingsData.system?.backend_server_status || 'Online'}</span>
                </div>

                <div className="status-indicator-card">
                  <span>Frontend Integration</span>
                  <span className="badge-status-ok">{settingsData.system?.frontend_status || 'Connected'}</span>
                </div>

                <div className="status-indicator-card">
                  <span>Django Debug Mode</span>
                  <span className="badge-status-ok" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    {settingsData.system?.debug_mode ? 'Development (ON)' : 'Production Safe (OFF)'}
                  </span>
                </div>

                <div className="status-indicator-card">
                  <span>Admin Session Security</span>
                  <span className="badge-status-ok">{settingsData.security?.session_timeout || '30 Mins Timeout'}</span>
                </div>

                <div className="status-indicator-card">
                  <span>Login Protection & Rate Limiting</span>
                  <span className="badge-status-ok">Enabled (Active)</span>
                </div>

                <div className="status-indicator-card">
                  <span>Application Version</span>
                  <span className="badge-status-ok" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                    {settingsData.system?.app_version || 'v2.4.0 (Build 2026)'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
