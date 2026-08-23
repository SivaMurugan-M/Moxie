import React, { useState } from "react";

/**
 * Reusable password input with show/hide eye toggle.
 * Props:
 *   name        – input name attribute
 *   placeholder – input placeholder text
 *   value       – controlled value (optional)
 *   onChange    – change handler (optional)
 *   error       – validation error string
 *   id          – unique id for the input
 */
function PasswordInput({ name, placeholder, value, onChange, error, id }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="pw-input-wrapper">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder || "Password"}
        value={value}
        onChange={onChange}
        className={`auth-input${error ? " auth-input--error" : ""}`}
        autoComplete="current-password"
      />
      <button
        type="button"
        className="pw-eye-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? (
          /* Eye-open icon */
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          /* Eye-off icon */
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default PasswordInput;
