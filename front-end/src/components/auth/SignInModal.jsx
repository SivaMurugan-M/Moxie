import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./SignInModal.css";

/**
 * SignInModal
 * Fixed modal popup for Sign In, rendered strictly over the Home Page.
 */
function SignInModal({ onClose }) {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const showToast = useToast();

  /* ── Form state ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /* ── Lock body scroll cleanly without altering layout width ── */
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  /* ── Close on Escape key ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /* ── Validation ── */
  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) {
      errs.password = "Password is required.";
    }
    return errs;
  };

  /* ── Submit Login ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    login(email.trim());
    showToast("✓ Signed in successfully! Welcome back.");
    onClose();
  };

  /* ── Navigate to Register ── */
  const handleCreateAccount = () => {
    onClose();
    navigate("/register");
  };

  /* ── Live validation on change after first submit attempt ── */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (submitted) {
      const errs = { ...errors };
      if (!e.target.value.trim()) {
        errs.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
        errs.email = "Please enter a valid email address.";
      } else {
        delete errs.email;
      }
      setErrors(errs);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (submitted) {
      const errs = { ...errors };
      if (!e.target.value) {
        errs.password = "Password is required.";
      } else {
        delete errs.password;
      }
      setErrors(errs);
    }
  };

  return (
    <div
      className="login-overlay auth-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in dialog"
    >
      <div
        className="login-modal auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="auth-modal-close"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Heading */}
        <h2 className="auth-modal-heading">Sign in</h2>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} noValidate className="auth-form">

          {/* Email field */}
          <div className="auth-field-group">
            <label htmlFor="signin-email" className="auth-label">
              Email<span className="auth-required">*</span>
            </label>
            <input
              id="signin-email"
              type="email"
              name="email"
              placeholder="Email*"
              value={email}
              onChange={handleEmailChange}
              className={`form-control${errors.email ? " form-control--error" : ""}`}
              autoComplete="email"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* Password field */}
          <div className="auth-field-group">
            <label htmlFor="signin-password" className="auth-label">
              Password<span className="auth-required">*</span>
            </label>
            <div className="pw-input-wrapper">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password*"
                value={password}
                onChange={handlePasswordChange}
                className={`form-control${errors.password ? " form-control--error" : ""}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pw-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  /* Eye-open icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  /* Eye-off icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {/* Lost password link */}
          <button
            type="button"
            className="lost-password-link"
            onClick={() => showToast("Password reset is a frontend demo.")}
          >
            Lost your password?
          </button>

          {/* Yellow Sign In Button */}
          <button
            id="signin-submit-btn"
            type="submit"
            className="auth-button auth-button--primary"
          >
            SIGN IN
          </button>

          {/* Outlined Create Your Account Button */}
          <button
            id="signin-create-account-btn"
            type="button"
            className="auth-button auth-button--outline"
            onClick={handleCreateAccount}
          >
            CREATE YOUR ACCOUNT
          </button>

        </form>
      </div>
    </div>
  );
}

export default SignInModal;
