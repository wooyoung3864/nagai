// components/Navbar.tsx
import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <div className="navbar">
      <button className="logo">
        <img src="/assets/imgs/nagai_logo.png" alt="nagAI logo" className="logo-img" />
      </button>
      <button className="username">WooHyoung Ji</button>
    </div>
  );
}