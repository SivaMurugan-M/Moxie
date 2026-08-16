import React, { useState } from "react";

export default function ProfileDetails({ profile, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    mobile: profile?.mobile || "",
    avatar: profile?.avatar || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="panel-header">
        <h2>My Profile</h2>
        {!isEditing && (
          <button className="primary-btn" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger p-2 mb-3">{error}</div>}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="avatar-upload-section">
            <img
              src={formData.avatar || "https://via.placeholder.com/150"}
              alt="Avatar Preview"
              className="avatar-preview"
            />
            <div className="flex-grow-1">
              <label className="d-block mb-1" style={{ fontSize: "13px", fontWeight: "600" }}>
                Avatar URL
              </label>
              <input
                type="text"
                name="avatar"
                className="avatar-url-input w-100"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="Paste image link here"
              />
            </div>
          </div>

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
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
              style={{ minWidth: "100px" }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setFormData({
                  name: profile?.name || "",
                  mobile: profile?.mobile || "",
                  avatar: profile?.avatar || "",
                });
                setIsEditing(false);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-label">Full Name</div>
              <div className="detail-value">{profile?.name}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Email Address</div>
              <div className="detail-value">{profile?.email}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Mobile Number</div>
              <div className="detail-value">{profile?.mobile || "Not Provided"}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Account Joined</div>
              <div className="detail-value">{profile?.joinedDate}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
