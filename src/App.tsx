import React from 'react';
import Navbar from './components/Navbar/Navbar';
import WebcamFeed from './components/WebcamFeed/WebcamFeed';
import Timer from './components/Timer/Timer';
import GestureHelpButton from './components/GestureHelpButton/GestureHelpButton';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import MainPage from './pages/MainPage/MainPage';
import LoginFailPage from './pages/LoginFailPage/LoginFailPage';
import TermsPage from './pages/TermsPage/TermsPage';
import AccountCreationPage from './pages/AccountCreationPage/AccountCreationPage';
import MyPage from './pages/MyPage/MyPage';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login-fail" element={<LoginFailPage />} />
        <Route path="/account-creation" element={<AccountCreationPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </div>
    
  );
  
}
