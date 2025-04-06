import React from 'react';

export default function LoginFailPage() {
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
      <div className='fail-message'>
      <div className="fail-message">
        <h3>Failed to authenticate with Google.</h3>
        <h3>Please try again</h3>
      </div>
      </div>
    </div>
  );
}