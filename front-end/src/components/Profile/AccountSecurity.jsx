import React, { useState } from "react";

export default function AccountSecurity({ profile, onDeleteAccount }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Simulate API change delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setSuccess("Your account password has been updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Failed to update password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      alert("Please type 'DELETE' in all caps to confirm.");
      return;
    }
    if (window.confirm("WARNING: This will permanently delete your Moxie account. Click OK to proceed.")) {
      onDeleteAccount();
    }
  };

  return (
    <div>
      <div className="panel-header">
        <h2>Account & Security</h2>
      </div>

      <div className="security-list">
        {/* Verification Status Card */}
        <div className="p-3 border rounded-3 bg-light">
          <h3 className="mb-3" style={{ fontSize: "15px", fontWeight: "700" }}>Verification Metrics</h3>
          <div className="security-row-item">
            <div className="security-info">
              <h4>Email Authentication</h4>
              <p>{profile?.email || "Not registered"}</p>
            </div>
            <div>
              <span className="verification-pill verified">Verified ✓</span>
            </div>
          </div>
          <div className="security-row-item pt-3">
            <div className="security-info">
              <h4>Mobile Number Link</h4>
              <p>{profile?.mobile || "Not linked yet"}</p>
            </div>
            <div>
              <span className="verification-pill not-verified">Pending Link</span>
            </div>
          </div>
        </div>

        {/* Change Password form */}
        <div className="p-3 border rounded-3">
          <h3 className="mb-3" style={{ fontSize: "15px", fontWeight: "700" }}>Update Password</h3>
          {error && <div className="alert alert-danger p-2 mb-3" style={{ fontSize: "13px" }}>{error}</div>}
          {success && <div className="alert alert-success p-2 mb-3" style={{ fontSize: "13px" }}>{success}</div>}

          <form onSubmit={handlePasswordChange}>
            <div className="profile-form-grid mb-3">
              <div className="profile-form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Dangerous Operations: Account Deletion */}
        <div className="p-3 border border-danger rounded-3 bg-light">
          <h3 className="text-danger mb-2" style={{ fontSize: "15px", fontWeight: "700" }}>Danger Zone</h3>
          <p className="text-muted mb-3" style={{ fontSize: "12px" }}>
            Deleting your account is permanent and cannot be undone. All your order history, shipping details, and wishlist records will be deleted.
          </p>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Type 'DELETE' to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="form-control"
              style={{ width: "220px", fontSize: "13px" }}
            />
            <button className="primary-btn bg-danger border-danger" onClick={handleDelete}>
              Permanent Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
