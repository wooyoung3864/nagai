// pages/NotFoundPage/NotFoundPage.tsx
import React from 'react';
import logo from '../../assets/imgs/nagai_logo.png';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="login-container">
      <div className="login-flex-col">
        <div className="login-logo">
          <img src={logo} alt="nagAI logo" />
        </div>
        <div className="notfound-text">
          <h2>404 - Page Not Found</h2>
          <p>Oops! The page you're looking for doesn’t exist.</p>
        </div>
      </div>
    </div>
  );
}
