// components/Navbar.tsx
import React from 'react';
import logo from '../../assets/imgs/nagai_logo.png';

import './Navbar.css';

export default function Navbar() {
  return (
    <div className="navbar">
      <button className="logo">
        <img src={logo} alt="nagAI logo" className="logo-img" />
      </button>
      <button className="username">Woohyoung Ji</button>
    </div>
  );
}