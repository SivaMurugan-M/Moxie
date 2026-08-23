import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./Register.css";

export default function Register() {
  const { register } = useContext(AuthContext);
  const showToast = useToast();
  const navigate = useNavigate();

  /* ── Form state ── */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /* ── Helpers ── */
  const update = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    if (submitted) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
    }
  };

  const validateField = (field, val) => {
    switch (field) {
      case "firstName":
        return val.trim().length < 1 ? "First name is required." : "";
      case "lastName":
        return val.trim().length < 1 ? "Last name is required." : "";
      case "email":
        if (!val.trim()) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
          return "Please enter a valid email address.";
        return "";
      case "password":
        return val.length < 6
          ? "Password must be at least 6 characters."
          : "";
      default:
        return "";
    }
  };

  const validate = () => {
    const errs = {};
    Object.keys(form).forEach((f) => {
      const msg = validateField(f, form[f]);
      if (msg) errs[f] = msg;
    });
    return errs;
  };

  /* ── Submit ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    register(fullName || "User", form.email.trim());
    showToast("✓ Account created! Welcome to Moxie.");
    navigate("/");
  };

  /* ── Go to Sign In: navigate home with state to open modal automatically ── */
  const handleSignIn = () => {
    navigate("/", {
      state: {
        openProfile: true,
      },
    });
  };

  return (
    <main className="register-section">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>

        <form onSubmit={handleSubmit} noValidate className="register-form">
          {/* First Name */}
          <div className="form-group">
            <input
              id="register-firstname"
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={update("firstName")}
              className={`form-control${errors.firstName ? " form-control--error" : ""}`}
              autoComplete="given-name"
            />
            {errors.firstName && (
              <p className="field-error">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <input
              id="register-lastname"
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={update("lastName")}
              className={`form-control${errors.lastName ? " form-control--error" : ""}`}
              autoComplete="family-name"
            />
            {errors.lastName && (
              <p className="field-error">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={update("email")}
              className={`form-control${errors.email ? " form-control--error" : ""}`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="field-error">{errors.email}</p>
            )}
          </div>

          {/* Password with eye toggle */}
          <div className="form-group">
            <div className="pw-input-wrapper">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={update("password")}
                className={`form-control${errors.password ? " form-control--error" : ""}`}
                autoComplete="new-password"
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
            {errors.password && (
              <p className="field-error">{errors.password}</p>
            )}
          </div>

          {/* Marketing tagline */}
          <p className="register-description">
            Join Moxie for early access to exclusive drops, trending styles, special offers, and personalized new arrivals.
          </p>

          {/* Register Button */}
          <button
            id="register-submit-btn"
            type="submit"
            className="auth-button auth-button--primary"
          >
            REGISTER
          </button>

          {/* Sign In Button */}
          <button
            id="register-signin-btn"
            type="button"
            className="auth-button auth-button--outline"
            onClick={handleSignIn}
          >
            SIGN IN
          </button>
        </form>
      </div>
    </main>
  );
}
