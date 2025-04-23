import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import './Timer.css';
import DistractionModal from '../DistractionModal/DistractionModal';

const FOCUS_DURATION = 3;
const BREAK_DURATION = 3;

interface TimerProps {
  onSessionComplete: (duration: number, wasFocus: boolean) => void;
  onFocusChange: (isFocus: boolean) => void;
  onRunningChange: (isRunning: boolean) => void;
}

export default function Timer({
  onSessionComplete,
  onFocusChange,
  onRunningChange,
}: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_DURATION);
  const [isFocus, setIsFocus] = useState(true);
  const [distractionVisible, setDistractionVisible] = useState(false);
  const [focusAccumulated, setFocusAccumulated] = useState(0);

  const sessionStartRef = useRef<number | null>(null);
  const progress = useMotionValue(0);
  const progressTransform = useTransform(progress, p => `${100 - p}%`);

  const computeElapsed = () =>
    sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;

  const commitFocusTime = () => {
    if (isFocus && sessionStartRef.current) {
      const delta = computeElapsed();
      setFocusAccumulated(prev => prev + delta);
      onSessionComplete(delta, true);
      sessionStartRef.current = null;
    }
  };

  const startTimer = () => {
    if (!isRunning) {
      onFocusChange(isFocus);
      onRunningChange(true);
      setIsRunning(true);
      if (isFocus) sessionStartRef.current = Date.now();
    }
  };

  const pauseTimer = () => {
    if (!isRunning) return;

    // **Accumulate any focus time up to this pause.**
    if (isFocus) {
      commitFocusTime();
    }

    setIsRunning(false);
    onRunningChange(false);
  };

  const stopTimer = () => {
    if (isRunning && isFocus) {
      commitFocusTime();
    }
    setIsRunning(false);
    setIsFocus(true);
    setRemainingSeconds(FOCUS_DURATION);
    setFocusAccumulated(0);
    progress.set(0);
    sessionStartRef.current = null;
    onRunningChange(false);
  };

  const handleDistraction = () => {
    if (isRunning && isFocus) {
      commitFocusTime();
    }
    setIsRunning(false);
    onRunningChange(false);
    sessionStartRef.current = null;
    setDistractionVisible(true);
  };

  useEffect(() => {
    onFocusChange(isFocus);
    if (!isRunning) return;

    if (isFocus && sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
    }

    const controls = animate(progress, 100, {
      duration: remainingSeconds,
      ease: 'linear',
      onComplete: () => {
        // commit end-of-session time
        if (sessionStartRef.current) {
          const delta = computeElapsed();
          if (isFocus) {
            setFocusAccumulated(prev => prev + delta);
          }
          onSessionComplete(delta, isFocus);
        }

        // toggle focus/break *and* reset duration together
        setIsFocus(prev => {
          const next = !prev;
          setRemainingSeconds(next ? FOCUS_DURATION : BREAK_DURATION);
          return next;
        });

        // reset progress & start next session immediately
        progress.set(0);
        sessionStartRef.current = Date.now();
      },
    });

    const ticker = window.setInterval(() => {
      setRemainingSeconds(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      controls.stop();
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

      <div className="d-flex justify-content-center align-items-center">
        {!isRunning ? (
          <button className="timer-btn-temp" onClick={startTimer}>
            Start
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

      <DistractionModal
        isVisible={distractionVisible}
        onDismiss={() => {
          setDistractionVisible(false);
          startTimer();
        }}
      />
    </>
  );
}
