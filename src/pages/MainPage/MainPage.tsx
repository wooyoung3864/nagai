// src/pages/MainPage.tsx
import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import WebcamFeed from '../../components/WebcamFeed/WebcamFeed';
import GestureHelpButton from '../../components/GestureHelpButton/GestureHelpButton';
import Timer from '../../components/Timer/Timer';
import DistractionsButton from '../../components/DistractionsButton/DistractionsButton';
import FocusButton from '../../components/FocusButton/FocusButton';
import { motion, AnimatePresence } from 'framer-motion';
import '../../App.css';
import './MainPage.css';

export default function MainPage() {
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleOverlay = () => setShowOverlay(prev => !prev);

  return (
    <>
      <Navbar />
      <motion.div
        className="main-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="center-content">
          <div className="webcam-timer-row">
            <div className="webcam-wrapper">
              <div className="col-flex webcam-col-flex">
                <WebcamFeed showOverlay={showOverlay} />
                <DistractionsButton />
              </div>
              <GestureHelpButton onClick={toggleOverlay} />
            </div>
            <div className="timer-wrap">
              <div className='col-flex timer-col-flex'>
                <div className='timer-wrap-inner'>
                  <Timer />
                </div>
                <FocusButton />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
