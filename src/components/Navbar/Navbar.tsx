import React from 'react';
import logo from '../../assets/imgs/nagai_logo.png';
import { useUser } from '../../contexts/UserContext';

import './Navbar.css';

export default function Navbar() {
  const { name } = useUser();

  return (
    <div className="nagai-navbar">
      <button className="logo">
        <img src={logo} alt="nagAI logo" className="logo-img" />
      </button>
      <button className="username">{name || 'Guest'}</button>
    </div>
  );
}
