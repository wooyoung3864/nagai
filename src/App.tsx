import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import MainPage from './pages/MainPage/MainPage';
import LoginFailPage from './pages/LoginFailPage/LoginFailPage';
import TermsPage from './pages/TermsPage/TermsPage';
import AccountCreationPage from './pages/AccountCreationPage/AccountCreationPage';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </div>
    
  );
  
}
