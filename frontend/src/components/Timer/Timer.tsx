import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import './Timer.css';

const FOCUS_DURATION = 15;
const BREAK_DURATION = 10;

interface TimerProps {
  onSessionComplete: (duration: number, wasFocus: boolean) => void;
  onFocusChange: (isFocus: boolean) => void;
  onRunningChange: (isRunning: boolean) => void;
}

export default function Timer({ onSessionComplete, onFocusChange, onRunningChange }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const progress = useMotionValue(0);
  const sessionStartRef = useRef<number | null>(null);

  const total = isFocus ? FOCUS_DURATION : BREAK_DURATION;

  const startTimer = () => {
    if (!isRunning) {
      onFocusChange(isFocus);
      onRunningChange(true);
      setIsRunning(true);
      sessionStartRef.current = Date.now();
    }
  };

  const pauseTimer = () => {
    if (isRunning && isFocus && sessionStartRef.current) {
      const elapsedSec = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      onSessionComplete(elapsedSec, true);
    }

    setIsRunning(false);
    onRunningChange(false);
  };


  const stopTimer = () => {
    setIsRunning(false);
    setIsFocus(true);
    setTimeLeft(FOCUS_DURATION);
    progress.set(0);
    onRunningChange(false);

    if (isRunning && isFocus && sessionStartRef.current) {
      const elapsedSec = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      onSessionComplete(elapsedSec, true);
    }
  };

  useEffect(() => {
    onFocusChange(isFocus);

    if (!isRunning) return;

    const controls = animate(progress, 100, {
      duration: total,
      ease: 'linear',
      onComplete: () => {
        onSessionComplete(total, isFocus);
        const nextFocus = !isFocus;
        setIsFocus(nextFocus);
        setTimeLeft(nextFocus ? FOCUS_DURATION : BREAK_DURATION);
        setIsRunning(true);
        progress.set(0);
        onRunningChange(false);
      }
    });

    let secondsLeft = total;
    setTimeLeft(secondsLeft);
    const tickInterval = window.setInterval(() => {
      secondsLeft--;
      setTimeLeft(secondsLeft);
    }, 1000);

    return () => {
      controls.stop();
      clearInterval(tickInterval);
    };
  }, [isRunning, isFocus]);

  return (
    <>
      <motion.div
        className="timer-circle"
        style={{
          '--progress': useTransform(progress, (p) => `${100 - p}%`),
          '--border-color': isFocus ? '#EF4444' : '#65B3EB'
        } as React.CSSProperties}
      >
        <div className="timer-text">
          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </motion.div>

      <div className="d-flex justify-content-center align-items-center">
        {!isRunning ? (
          <button className="timer-btn-temp" onClick={startTimer}>Start</button>
        ) : (
          <>
            {isFocus && (
              <button className="timer-btn-temp" onClick={pauseTimer}>Pause</button>
            )}
            <button className="timer-btn-temp" onClick={stopTimer}>Stop</button>
          </>
        )}
      </div>
    </>
  );
}
