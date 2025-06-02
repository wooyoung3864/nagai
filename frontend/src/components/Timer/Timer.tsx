// src/components/Timer/Timer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useBehaviorDetection } from '../../hooks/useBehaviorDetection';
import './Timer.css';
import DistractionModal from '../DistractionModal/DistractionModal';
import { useSupabase } from '../../contexts/SupabaseContext';
import { SessionHandler } from '../../hooks/useSessionHandler';
import { permission } from 'process';

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;
const FLUSH_INTERVAL_MS =
  (FOCUS_DURATION * 60 * 1000) / 5;   // 2 s in dev, 5 min in prod

// backend API base URL

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
  // Add these fields from sessionHandler:
  startSessionOnServer: SessionHandler['startSessionOnServer'];
  updateSessionStatus: SessionHandler['updateSessionStatus'];
  sessionIdRef: SessionHandler['sessionIdRef'];
  setSessionId: SessionHandler['setSessionId'];
}

export default function Timer({
  externalTimerControlsRef,
  externalTimerStateRef,
  onRunningChange,
  onFocusChange,
  onSessionComplete,
  startSessionOnServer,
  updateSessionStatus,
  sessionIdRef,
  setSessionId,
}: TimerProps) {
  const supabase = useSupabase();
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const [_, setWasPaused] = useState(false);
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

  const distractionAudio = new Audio('/distractionsound.mp3');
  const breakAudio = new Audio('/breaksound.wav')

  const {
    startBehaviorDetection = () => { },
    stopBehaviorDetection = () => { },
    setModalVisible = () => { },
  } = useBehaviorDetection({
    videoRef,
    externalTimerControlsRef,
    externalTimerStateRef,
    supabase,
    sessionIdRef,
    onFocusScore: () => { }, // no-op handler to satisfy required prop
  }) || {};


  const computeElapsed = () => sessionStartRef.current
    ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
    : 0;

  const commitFocusTime = async (status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'STOPPED' = 'RUNNING') => {
    if (isFocus && sessionStartRef.current) {
      const delta = computeElapsed();
      const updatedTotal = focusAccumulated + delta;

      setFocusAccumulated(updatedTotal);
      onSessionComplete(delta, true);
      sessionStartRef.current = null;

      if (sessionIdRef.current !== null) {
        await updateSessionStatus(status, updatedTotal);
      }
    }
  };

  const startTimer = async () => {
    if (distractionVisibleRef.current || isRunningRef.current) return;

    const success = await startSessionOnServer(isFocus ? 'FOCUS' : 'BREAK');

    if (!success) {
      console.error("Error starting session.");
      return;
    }
    // }

    setIsRunning(true);
    isRunningRef.current = true;
    externalTimerStateRef.current.isRunning = true;
    externalTimerStateRef.current.isPaused = false;
    onRunningChange(true);

    sessionStartRef.current = Date.now();
    setWasPaused(false);
  };

  const resumeTimer = async () => {
    if (distractionVisibleRef.current || isRunningRef.current) return;

    setIsRunning(true);
    isRunningRef.current = true;
    externalTimerStateRef.current.isRunning = true;
    externalTimerStateRef.current.isPaused = false;
    onRunningChange(true);

    sessionStartRef.current = Date.now();
    setWasPaused(false);

    if (sessionIdRef.current !== null) {
      await updateSessionStatus('RUNNING');
    } else {
      const success = await startSessionOnServer(isFocus ? 'FOCUS' : 'BREAK');
      if (!success) {
        console.error("Error starting session.");
      }
    }
  };

  const pauseTimer = async () => {
    if (!isRunningRef.current) return;

    // 🟢 1. Immediately pause the UI
    setIsRunning(false);
    isRunningRef.current = false;
    externalTimerStateRef.current.isRunning = false;
    externalTimerStateRef.current.isPaused = true;
    onRunningChange(false);
    setWasPaused(true);

    // 🟢 2. Commit focus time (which already updates backend)
    if (isFocus) {
      await commitFocusTime('PAUSED');
      // (remove any redundant backend call here)
    }
  };

  const stopTimer = async () => {
    // 1️⃣ Immediately update UI state and refs
    setIsRunning(false);
    isRunningRef.current = false;
    externalTimerStateRef.current.isRunning = false;
    externalTimerStateRef.current.isPaused = false;
    onRunningChange(false);

    setWasPaused(false);

    // 2️⃣ Commit focus time and update backend (async, does not block UI)
    await commitFocusTime('STOPPED');

    // 3️⃣ Reset timer-related state for next session
    setIsFocus(true);
    setRemainingSeconds(FOCUS_DURATION);
    setFocusAccumulated(0);
    sessionStartRef.current = null;

    // 4️⃣ Stop progress animation
    controlsRef.current?.stop();
    progress.set(0);
    progress.clearListeners();
  };

  const handleDistraction = async () => {
    await commitFocusTime('PAUSED');
    console.log('Distraction triggered. Session ID:', sessionIdRef.current);

    setIsRunning(false);
    isRunningRef.current = false;
    externalTimerStateRef.current.isRunning = false;
    onRunningChange(false);
    sessionStartRef.current = null;

    setModalVisible(true);
    stopBehaviorDetection();

    setDistractionVisible(true);
    distractionVisibleRef.current = true;
    externalTimerStateRef.current.isDistractionModalVisible = true;

    notifyUser("Distraction Detected");

    try {
      distractionAudio.currentTime = 0; // rewind
      distractionAudio.volume = 1;
      distractionAudio.play();
    } catch (e) {
      console.error("Distraction Audio playback failed:", e);
    }
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
      externalTimerControlsRef.current.nextSession = nextSession
      externalTimerControlsRef.current.distraction = handleDistraction;
    }
  }, []);

  useEffect(() => {
    if (!isRunningRef.current || !isFocus) return;

    const id = setInterval(() => {
    }, FLUSH_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isRunning, isFocus]);

  const nextSession = async () => {
    if (isRunningRef.current && isFocus) {
      await commitFocusTime('COMPLETED');

      // 🔧 Reset before creating the next session
      sessionIdRef.current = null;
      setSessionId(null);

      try {
        breakAudio.currentTime = 0; // rewind
        breakAudio.volume = 1;
        breakAudio.play();
      } catch (e) {
        console.error("Break Audio playback failed:", e);
      }
    }

    const nextIsFocus = !isFocus;
    setIsFocus(nextIsFocus);
    setRemainingSeconds(nextIsFocus ? FOCUS_DURATION : BREAK_DURATION);
    externalTimerStateRef.current.isDuringBreak = !nextIsFocus;
    sessionStartRef.current = Date.now();
    setFocusAccumulated(0);
    progress.set(0);

    await startSessionOnServer(nextIsFocus ? 'FOCUS' : 'BREAK');
  };

  function notifyUser(notificationText = "Distraction Detected"){
    if(!("Notification" in window)){
      alert("Browser does not support notifications");
    }else if(Notification.permission === "granted"){
      const notification = new Notification(notificationText)
    }else if(Notification.permission !== "denied"){
      Notification.requestPermission().then((permission) => {
        if(permission === "granted"){
          const notification = new Notification(notificationText)
        }
      })
    }
  }

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

      <DistractionModal
        isVisible={distractionVisible}
        onDismiss={() => {
          setDistractionVisible(false);
          distractionVisibleRef.current = false;
          externalTimerStateRef.current.isDistractionModalVisible = false;
          setModalVisible(false); // this ref refers to the modal in UseBehaviorDetection.ts.
          resumeTimer(); // NOT startTimer();
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
