// App.tsx
import React from 'react';
import Navbar from './components/Navbar/Navbar';
import WebcamFeed from './components/WebcamFeed/WebcamFeed';
import Timer from './components/Timer/Timer';
import GestureHelp from './components/GestureHelp/GestureHelp';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import LoginFailPage from './pages/LoginFailPage';
import TermsPage from './pages/TermsPage';
import AccountCreationPage from './pages/AccountCreationPage';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <MainPage />
    </div>
  );
}