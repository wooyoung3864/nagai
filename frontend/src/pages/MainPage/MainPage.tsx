import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import WebcamFeed from '../../components/WebcamFeed/WebcamFeed';
import GestureHelpButton from '../../components/GestureHelpButton/GestureHelpButton';
import Timer from '../../components/Timer/Timer';
import DistractionsButton from '../../components/DistractionsButton/DistractionsButton';
import FocusButton from '../../components/FocusButton/FocusButton';
import { motion } from 'framer-motion';
import '../../App.css';
import './MainPage.css';

export default function MainPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFocus, setIsFocus] = useState(true);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);

  const toggleOverlay = () => setShowOverlay((prev) => !prev);

  const handleSessionComplete = (duration: number, wasFocus: boolean) => {
    if (wasFocus) {
      setTotalFocusSeconds((prev) => prev + duration);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

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
                <WebcamFeed
                  showOverlay={showOverlay}
                  setCameraAvailable={setCameraAvailable}
                  setErrorMessage={setErrorMessage}
                  cameraAvailable={cameraAvailable}
                  errorMessage={errorMessage}
                  cameraInitialized={cameraInitialized}
                  setCameraInitialized={setCameraInitialized}
                />
                {(!isTimerRunning || !isFocus) && <DistractionsButton />}
              </div>
              {cameraAvailable && (
                <GestureHelpButton onClick={toggleOverlay} />
              )}
            </div>
            <div className="timer-wrap">
              <div className="col-flex timer-col-flex">
                <div className="timer-wrap-inner">
                  <Timer
                    onSessionComplete={handleSessionComplete}
                    onFocusChange={setIsFocus}
                    onRunningChange={setIsTimerRunning}
                  />
                </div>
                {(!isTimerRunning || !isFocus) && <FocusButton focustime={formatTime(totalFocusSeconds)} />}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
