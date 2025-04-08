// src/pages/MainPage.tsx
import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import WebcamFeed from '../../components/WebcamFeed/WebcamFeed';
import GestureHelpButton from '../../components/GestureHelpButton/GestureHelpButton';
import Timer from '../../components/Timer/Timer';
import DistractionsButton from '../../components/DistractionsButton/DistractionsButton';
import FocusButton from '../../components/FocusButton/FocusButton';
import '../../App.css';
import './MainPage.css';

export default function MainPage() {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="center-content">
          <div className="webcam-timer-row">
            <div className="webcam-wrapper">
              <div className="col-flex">
                <WebcamFeed />
                <DistractionsButton />
              </div>
              <GestureHelpButton />
            </div>

            <div className="col-flex timer-wrap">
              <Timer />
              <FocusButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
