// App.tsx
import React from 'react';
import Navbar from './components/Navbar/Navbar';
import WebcamFeed from './components/WebcamFeed/WebcamFeed';
import Timer from './components/Timer/Timer';
import GestureHelp from './components/GestureHelp/GestureHelp';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <div className="left-column">
          <div className="webcam-wrapper">
            <WebcamFeed />
            <GestureHelp />
          </div>
          <Timer />
        </div>
      </div>
    </div>
  );
}