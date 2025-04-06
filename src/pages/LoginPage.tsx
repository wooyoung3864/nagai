import React from 'react';

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="logo">
        <img src="src/assets/imgs/nagai_logo.png" alt="nagai_logo.png" />
      </div>
      <button className="google-button">
        <img
          src="src/assets/imgs/google_logo.png"
          alt="Google-logo"
        />
      </button>
    </div>
  );
}