// src/pages/MainPage.tsx
import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import WebcamFeed from '../../components/WebcamFeed/WebcamFeed';
import GestureHelpButton from '../../components/GestureHelpButton/GestureHelpButton';
import Timer from '../../components/Timer/Timer';
import DistractionsButton from '../../components/DistractionsButton/DistractionsButton';
import FocusButton from '../../components/FocusButton/FocusButton';
import { motion } from 'framer-motion';
import '../../App.css'; // if needed for .main-content layout
import './MainPage.css';

export default function MainPage() {
  return (
    <>
      <Navbar />
      <motion.div
        className="main-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
              <div className="timer-wrap">
                <div className='col-flex timer-col-flex'>
                  <div className='timer-wrap'>
                    <Timer />
                  </div>
                  <FocusButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
