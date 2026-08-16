import React, { useState } from "react";

export default function Addresses({ addresses, onAddAddress, onUpdateAddress, onDeleteAddress, onSetDefault }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    flat: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    type: "Home",
    isDefault: false,
  });

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Chandigarh", "Delhi"
  ];

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      name: "",
      phone: "",
      flat: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      type: "Home",
      isDefault: false,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      flat: addr.flat,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingAddress) {
      await onUpdateAddress(editingAddress.id, formData);
    } else {
      await onAddAddress(formData);
    }
    setIsEditing(false);
  };

  return (
    <div>
      <div className="panel-header">
        <h2>My Addresses</h2>
        {!isEditing && (
          <button className="primary-btn" onClick={handleOpenAdd}>
            ➕ Add New Address
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <h4 className="mb-3" style={{ fontSize: "15px", fontWeight: "700" }}>
            {editingAddress ? "Edit Shipping Address" : "Register New Address"}
          </h4>

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>

            <div className="profile-form-group">
              <label>House / Flat No.</label>
              <input
                type="text"
                name="flat"
                value={formData.flat}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-form-group">
              <label>Street / Area</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-form-group">
              <label>State</label>
              <select name="state" value={formData.state} onChange={handleChange} required>
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="profile-form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength="6"
                pattern="\d{6}"
                placeholder="XXXXXX"
                required
              />
            </div>

            <div className="profile-form-group">
              <label>Address Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Home">Home (All-day delivery)</option>
                <option value="Work">Work (10 AM - 5 PM delivery)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              disabled={editingAddress?.isDefault}
            />
            <label className="form-check-label ms-2" htmlFor="isDefault" style={{ fontSize: "13px" }}>
              Set as my default shipping address
            </label>
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="primary-btn">
              {editingAddress ? "Update Address" : "Add Address"}
            </button>
            <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          {addresses.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📍</div>
              <h3 style={{ fontSize: "17px", fontWeight: "700" }}>No Addresses Found</h3>
              <p className="text-muted" style={{ fontSize: "14px" }}>
                Add your shipping addresses to speed up checkout.
              </p>
              <button className="primary-btn mt-3" onClick={handleOpenAdd}>
                ➕ Create First Address
              </button>
            </div>
          ) : (
            <div className="addresses-grid">
              {addresses.map((addr) => (
                <div key={addr.id} className={`address-item-card ${addr.isDefault ? "is-default" : ""}`}>
                  <span className="address-badge">{addr.type}</span>
                  <h3 className="address-name">{addr.name}</h3>
                  <p className="address-details">
                    {addr.flat}, {addr.area}<br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="address-phone">Phone: {addr.phone}</p>

                  <div className="address-actions">
                    <button className="secondary-btn btn-sm" onClick={() => handleOpenEdit(addr)}>
                      ✏️ Edit
                    </button>
                    <button
                      className="secondary-btn btn-sm text-danger"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this address?")) {
                          onDeleteAddress(addr.id);
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>
                    {!addr.isDefault && (
                      <button className="secondary-btn btn-sm" onClick={() => onSetDefault(addr.id)}>
                        ⭐ Set Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
