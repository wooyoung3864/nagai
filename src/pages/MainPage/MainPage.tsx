// src/pages/MainPage.tsx
import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import WebcamFeed from '../../components/WebcamFeed/WebcamFeed';
import GestureHelp from '../../components/GestureHelp/GestureHelp';
import Timer from '../../components/Timer/Timer';
import '../../App.css'; // if needed for .main-content layout
import './MainPage.css';

export default function MainPage() {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="center-content">
          <div className="webcam-timer-row">
            <div className="webcam-wrapper">
              <WebcamFeed />
              <GestureHelp />
            </div>
            <div className="timer-wrap">
              <Timer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
