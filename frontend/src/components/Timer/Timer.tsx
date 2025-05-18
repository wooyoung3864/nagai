// src/components/Timer/Timer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useBehaviorDetection } from '../../hooks/useBehaviorDetection'; // adjust path as needed
import './Timer.css';
import DistractionModal from '../DistractionModal/DistractionModal';

const FOCUS_DURATION = 30;
const BREAK_DURATION = 15;

// Timer.tsx
export interface TimerProps {
  externalTimerControlsRef: React.RefObject<{
    start?: () => void;
    pause?: () => void;
    stop?: () => void;
    resume?: () => void;
    nextSession?: () => void;
    distraction?: () => void;
  }>;
  externalTimerStateRef: React.RefObject<{
    isRunning: boolean;
    isPaused: boolean;
    isDuringBreak: boolean;
    isDistractionModalVisible?: boolean;
  }>;
  onRunningChange: (isRunning: boolean) => void
  onFocusChange: (isFocus: boolean) => void
  onSessionComplete: (duration: number, wasFocus: boolean) => void; // add this line
}

export default function Timer({
  externalTimerControlsRef,
  externalTimerStateRef,
  onRunningChange,
  onFocusChange,
  onSessionComplete
}: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const [wasPaused, setWasPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_DURATION);
  const [isFocus, setIsFocus] = useState(true);

  const [distractionVisible, setDistractionVisible] = useState(false);
  const distractionVisibleRef = useRef(false);

  const [focusAccumulated, setFocusAccumulated] = useState(0);

  const sessionStartRef = useRef<number | null>(null);
  const progress = useMotionValue(0);
  const progressTransform = useTransform(progress, p => `${100 - p}%`);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);  // Add

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { startBehaviorDetection, stopBehaviorDetection, setModalVisible } = useBehaviorDetection({
    videoRef,
    externalTimerControlsRef,
    externalTimerStateRef,
  });

  const computeElapsed = () => sessionStartRef.current
    ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
    : 0;

  const commitFocusTime = () => {
    if (isFocus && sessionStartRef.current) {
      const delta = computeElapsed();
      setFocusAccumulated(prev => prev + delta);

      // report accumulated focus time to MainPage
      onSessionComplete(delta, true);

      sessionStartRef.current = null;
    }
  };

  const startTimer = () => {
    if (distractionVisibleRef.current) {
      return; // disable startTimer if DistractionModal is visible
    }

    if (!isRunningRef.current) {
      setIsRunning(true);
      isRunningRef.current = true;
      externalTimerStateRef.current.isRunning = true;
      onRunningChange(true);  // updates MainPage
      externalTimerStateRef.current.isPaused = false;
      if (isFocus) sessionStartRef.current = Date.now();
      setWasPaused(false);
    }
  };

  const pauseTimer = () => {
    if (!isRunningRef.current) return;
    if (isFocus) commitFocusTime();
    setIsRunning(false);
    isRunningRef.current = false;
    externalTimerStateRef.current.isRunning = false;
    onRunningChange(false);  // updates MainPage
    externalTimerStateRef.current.isPaused = true;
    setWasPaused(true);
  };

  const stopTimer = () => {
    if (isRunning && isFocus) commitFocusTime();
    setIsRunning(false);
    setWasPaused(false);
    isRunningRef.current = false;
    setIsFocus(true);
    setRemainingSeconds(FOCUS_DURATION);
    setFocusAccumulated(0);
    externalTimerStateRef.current.isRunning = false;
    onRunningChange(false);
    externalTimerStateRef.current.isPaused = false;
    sessionStartRef.current = null;

    if (controlsRef.current) {
      controlsRef.current.stop();    // stop animation first
    }

    progress.set(0);                  // reset progress to 0

    progress.clearListeners();
  };

  const resumeTimer = () => {
    if (distractionVisibleRef.current) {
      return; // disable startTimer if DistractionModal is visible
    }

    if (!isRunningRef.current) {
      setIsRunning(true);
      isRunningRef.current = true;
      externalTimerStateRef.current.isRunning = true;
      onRunningChange(true);  // updates MainPage
      externalTimerStateRef.current.isPaused = false;
      sessionStartRef.current = Date.now();
      setWasPaused(false);
    }
  };

  const nextSession = () => {
    if (isRunningRef.current && isFocus) commitFocusTime();
    setIsFocus(prev => !prev);
    setRemainingSeconds(isFocus ? BREAK_DURATION : FOCUS_DURATION);
    externalTimerStateRef.current.isDuringBreak = !isFocus;
    sessionStartRef.current = Date.now();
    setFocusAccumulated(0);
    progress.set(0);
  };

  const handleDistraction = () => {
    if (isRunning && isFocus) commitFocusTime();
    setIsRunning(false);
    isRunningRef.current = false;
    externalTimerStateRef.current.isRunning = false;
    onRunningChange(false);  // updates MainPage
    sessionStartRef.current = null;
    setModalVisible(true); // this ref refers to the modal in UseBehaviorDetection.ts.
    stopBehaviorDetection(); // add this to stop behaviorDetection while modal displayed
    setDistractionVisible(true);
    distractionVisibleRef.current = true;
    externalTimerStateRef.current.isDistractionModalVisible = true;
  };

  useEffect(() => {
    distractionVisibleRef.current = distractionVisible;
    externalTimerStateRef.current.isDistractionModalVisible = distractionVisible;
  }, [distractionVisible]); // ref to track distractionVisible state

  useEffect(() => {
    setModalVisible(false); // this ref refers to the modal in UseBehaviorDetection.ts.
    startBehaviorDetection();

    return () => {
      setModalVisible(true); // this ref refers to the modal in UseBehaviorDetection.ts.
      stopBehaviorDetection();
    };
  }, []);

  useEffect(() => {
    if (externalTimerControlsRef.current) {
      externalTimerControlsRef.current.start = startTimer;
      externalTimerControlsRef.current.pause = pauseTimer;
      externalTimerControlsRef.current.stop = stopTimer;
      externalTimerControlsRef.current.resume = resumeTimer;
      externalTimerControlsRef.current.nextSession = stopTimer; // instead of nextSession
      externalTimerControlsRef.current.distraction = handleDistraction;
    }
  }, []);

  // 🛠 Automatically sync isDuringBreak whenever isFocus changes
  useEffect(() => {
    externalTimerStateRef.current.isDuringBreak = !isFocus;
    onFocusChange(isFocus); // also report isFocus to MainPage
  }, [isFocus]);

  useEffect(() => {
    if (!isRunningRef.current) return;

    if (isFocus && sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
    }

    // instead of const controls = animate(...)
    controlsRef.current = animate(progress, 100, {
      duration: remainingSeconds,
      ease: 'linear',
      onComplete: () => {
        nextSession();
      },
    });

    const ticker = window.setInterval(() => {
      setRemainingSeconds(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      controlsRef.current?.stop();
      clearInterval(ticker);
    };
  }, [isRunning, isFocus]);

  return (
    <>
      {isRunning && isFocus && (
        <div className="d-flex justify-content-center mb-3">
          <button
            className="timer-btn-temp distract-btn-overlay"
            onClick={handleDistraction}
          >
            Distract Me!
          </button>
        </div>
      )}

      <motion.div
        className="timer-circle"
        style={{
          '--progress': progressTransform,
          '--border-color': isFocus ? '#EF4444' : '#65B3EB',
        } as React.CSSProperties}
      >
        <div className="timer-text">
          {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:
          {String(remainingSeconds % 60).padStart(2, '0')}
        </div>
      </motion.div>

      <></>

      <DistractionModal
        isVisible={distractionVisible}
        onDismiss={() => {
          setDistractionVisible(false);
          distractionVisibleRef.current = false;
          externalTimerStateRef.current.isDistractionModalVisible = false;
          setModalVisible(false); // this ref refers to the modal in UseBehaviorDetection.ts.
          startTimer();
          startBehaviorDetection();
        }}
      />
    </>
  );
}

/** temporary buttons for development (insert at <></> blocks for use)
 * {isRunning && isFocus && (
        <div className="d-flex justify-content-center mb-3">
          <button
            className="timer-btn-temp distract-btn-overlay"
            onClick={handleDistraction}
          >
            Distract Me!
          </button>
        </div>
      )}

 * <div className="d-flex justify-content-center align-items-center">
        {!isRunning ? (
          <button className="timer-btn-temp" onClick={startTimer}>
            {wasPaused ? 'Resume' : 'Start'}
          </button>
        ) : (
          <>
            {isFocus && (
              <button className="timer-btn-temp" onClick={pauseTimer}>
                Pause
              </button>
            )}
            <button className="timer-btn-temp" onClick={stopTimer}>
              Stop
            </button>
          </>
        )}
      </div>
 */
