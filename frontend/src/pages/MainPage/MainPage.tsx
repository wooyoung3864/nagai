import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import WebcamFeed from '../../components/WebcamFeed/WebcamFeed';
import Timer from '../../components/Timer/Timer';
import DistractionsButton from '../../components/DistractionsButton/DistractionsButton';
import FocusButton from '../../components/FocusButton/FocusButton';
import GestureHelpButton from '../../components/GestureHelpButton/GestureHelpButton';
import { motion } from 'framer-motion';
import '../../App.css';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';

export default function MainPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraInitialized, setCameraInitialized] = useState(false);

  const [isFocus, setIsFocus] = useState(true);
  const [_, setIsTimerRunning] = useState(false);

  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);

  const navigate = useNavigate();

  const supabase = useSupabase();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Redirect if terms not agreed or name not set
    if (!user?.has_agreed_terms) {
      navigate('/terms');
    } else if (!user?.has_set_name) {
      navigate('/create-account');
    }
  }, [navigate]);

  // External refs to control Timer & DistractionModal
  const externalTimerControlsRef = useRef<{
    start?: () => void;
    pause?: () => void;
    stop?: () => void;
    resume?: () => void;
    nextSession?: () => void;
    distraction?: () => void;
  }>({});

  const externalTimerStateRef = useRef<{
    isRunning: boolean;
    isPaused: boolean;
    isDuringBreak: boolean;
  }>({
    isRunning: false,
    isPaused: false,
    isDuringBreak: false,
  });

  const toggleOverlay = () => setShowOverlay(prev => !prev);

  const handleSessionComplete = (duration: number, wasFocus: boolean) => {
    if (wasFocus) {
      setTotalFocusSeconds(prev => prev + duration);
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
                  setShowOverlay={setShowOverlay}
                  setCameraAvailable={setCameraAvailable}
                  setErrorMessage={setErrorMessage}
                  cameraAvailable={cameraAvailable}
                  errorMessage={errorMessage}
                  cameraInitialized={cameraInitialized}
                  setCameraInitialized={setCameraInitialized}
                  externalTimerControlsRef={externalTimerControlsRef}
                  externalTimerStateRef={externalTimerStateRef}
                  supabase={supabase}
                />
                {(!externalTimerStateRef.current.isRunning || !isFocus) && <DistractionsButton />}
              </div>

              {cameraAvailable && (
                <GestureHelpButton onClick={toggleOverlay} />
              )}
            </div>

            <div className="timer-wrap">
              <div className="col-flex timer-col-flex">
                <div className="timer-wrap-inner">
                  <Timer
                    externalTimerControlsRef={externalTimerControlsRef}
                    externalTimerStateRef={externalTimerStateRef}
                    onRunningChange={setIsTimerRunning}   // ✅ pass the update functions
                    onFocusChange={setIsFocus}             // ✅ pass the update functions
                    onSessionComplete={handleSessionComplete}
                  />
                </div>

                {(!externalTimerStateRef.current.isRunning || !isFocus) && (
                  <FocusButton focustime={formatTime(totalFocusSeconds)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
