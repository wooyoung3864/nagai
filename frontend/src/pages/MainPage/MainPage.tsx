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
import { useSessionHandler } from '../../hooks/useSessionHandler';
import useIsMobile from '../../hooks/useIsMobile';


export default function MainPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [isFullWindow, setIsFullWindow] = useState(true);

  const [isFocus, setIsFocus] = useState(true);
  const [_, setIsTimerRunning] = useState(false);

  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [focusSecondsLoading, setFocusSecondsLoading] = useState(true);

  const [isWidescreen, setIsWidescreen] = useState(false);
  const isMobile = useIsMobile();

  const navigate = useNavigate();

  const supabase = useSupabase();

  const sessionHandler = useSessionHandler();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Redirect if terms not agreed or name not set
    if (!user?.has_agreed_terms) {
      navigate('/terms');
    } else if (!user?.has_set_name) {
      navigate('/create-account');
    }
  }, [navigate]);

  useEffect(() => {
    const checkFullWindow = () => {
      setIsFullWindow(window.innerWidth >= 1200);  // 너비 기준 조정 가능
    };
    checkFullWindow();
    window.addEventListener('resize', checkFullWindow);
    return () => window.removeEventListener('resize', checkFullWindow);
  }, []);

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

  // update totalFocusSeconds after each session
  const handleSessionComplete = () => {
    sessionHandler.getTodayTotalFocus().then(setTotalFocusSeconds);
  };

  const formatTime = (seconds: number) => {
    if (seconds === null || seconds === undefined) return '--';
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show intrusive alert
      alert('Would you like to reload? Your ongoing session will be stopped.');
      // Show confirmation dialog (browser default)
      e.preventDefault();
      e.returnValue = 'Would you like to reload? Your ongoing session will be stopped.'; // Most browsers ignore this text

      // Correct usage: call updateSessionStatus with "STOPPED"
      if (sessionHandler.sessionIdRef.current) {
        // Fire and forget; cannot await in beforeunload
        sessionHandler.updateSessionStatus("STOPPED");
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionHandler]);

  // fetch latest totalFocusSeconds value from backend on first page load
  useEffect(() => {
    sessionHandler.getTodayTotalFocus()
      .then(setTotalFocusSeconds)
      .finally(() => setFocusSecondsLoading(false));
  }, []); // ← Only on mount (or add dependencies if you want)

  // fetch latest totalFocusSeconds value from backend every time timer is paused or stopped
  useEffect(() => {
    // Wraps the original function and waits for it (if async) before fetching
    const wrapWithFocusUpdate = (origFn?: () => void | Promise<any>) => () => {
      setFocusSecondsLoading(true);
      const result = origFn ? origFn() : undefined;
      if (result && typeof result.then === 'function') {
        // If original returns a promise, wait for it
        result.then(() =>
          sessionHandler.getTodayTotalFocus()
            .then(setTotalFocusSeconds)
            .finally(() => setFocusSecondsLoading(false))
        );
      } else {
        // Otherwise, fetch immediately
        sessionHandler.getTodayTotalFocus()
          .then(setTotalFocusSeconds)
          .finally(() => setFocusSecondsLoading(false));
      }
    };

    // Only wrap if not already wrapped
    if (
      externalTimerControlsRef.current.pause &&
      externalTimerControlsRef.current.pause.name !== 'wrappedPause'
    ) {
      const origPause = externalTimerControlsRef.current.pause;
      externalTimerControlsRef.current.pause = function wrappedPause() {
        wrapWithFocusUpdate(origPause)();
      };
    }

    if (
      externalTimerControlsRef.current.stop &&
      externalTimerControlsRef.current.stop.name !== 'wrappedStop'
    ) {
      const origStop = externalTimerControlsRef.current.stop;
      externalTimerControlsRef.current.stop = function wrappedStop() {
        wrapWithFocusUpdate(origStop)();
      };
    }
  }, [
    externalTimerControlsRef.current.pause,
    externalTimerControlsRef.current.stop,
    sessionHandler,
  ]);

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
            {isFullWindow && !isMobile && cameraAvailable && (
                <button
                  className={`webcam-widescreen-toggle-button ${isWidescreen ? 'exit' : ''}`}
                  onClick={() => setIsWidescreen(prev => !prev)}
                >
                  {isWidescreen ? 'Exit Widescreen' : 'Widescreen Mode'}
                </button>
              )}
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
                  sessionIdRef={sessionHandler.sessionIdRef}
                  setSessionId={sessionHandler.setSessionId}
                  isWidescreen={isWidescreen}
                />
                {!isWidescreen && (!externalTimerStateRef.current.isRunning || !isFocus) && (
                  <DistractionsButton />
                )}
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
                    onRunningChange={setIsTimerRunning}
                    onFocusChange={setIsFocus}
                    onSessionComplete={handleSessionComplete}
                    startSessionOnServer={sessionHandler.startSessionOnServer}
                    updateSessionStatus={sessionHandler.updateSessionStatus}
                    sessionIdRef={sessionHandler.sessionIdRef}
                    setSessionId={sessionHandler.setSessionId}
                  />
                </div>
                {(!externalTimerStateRef.current.isRunning || !isFocus) && (
                  <FocusButton focusTime={focusSecondsLoading ? '--' : formatTime(totalFocusSeconds)} />
                )}
                </div>
              </div>
            

          </div>
        </div>
      </motion.div>
    </>
  );
}
