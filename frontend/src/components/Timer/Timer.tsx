// src/components/Timer/Timer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useBehaviorDetection } from '../../hooks/useBehaviorDetection'; // adjust path as needed
import './Timer.css';
import DistractionModal from '../DistractionModal/DistractionModal';
import { useSupabase } from '../../contexts/SupabaseContext';

const FOCUS_DURATION = 10;
const BREAK_DURATION = 5;

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
}

export default function Timer({
  externalTimerControlsRef,
  externalTimerStateRef,
  onRunningChange,
  onFocusChange,
  onSessionComplete
}: TimerProps) {
  const supabase = useSupabase();
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const [wasPaused, setWasPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_DURATION);
  const [isFocus, setIsFocus] = useState(true);

  const [distractionVisible, setDistractionVisible] = useState(false);
  const distractionVisibleRef = useRef(false);

  const [_, setSessionId] = useState<number | null>(null); // track current session ID for DB management
  const sessionIdRef = useRef<number | null>(null);

  const [focusAccumulated, setFocusAccumulated] = useState(0);

  const sessionStartRef = useRef<number | null>(null);
  const progress = useMotionValue(0);
  const progressTransform = useTransform(progress, p => `${100 - p}%`);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);  // Add

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const {
    startBehaviorDetection = () => {},
    stopBehaviorDetection = () => {},
    setModalVisible = () => {},
  } = useBehaviorDetection({
    videoRef,
    externalTimerControlsRef,
    externalTimerStateRef,
    supabase
  }) || {};

  const computeElapsed = () => sessionStartRef.current
    ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
    : 0;

  const commitFocusTime = async (status: 'RUNNING' | 'PAUSED' | 'COMPLETED' = 'RUNNING') => {
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

    // if session already exists, just resume it
    if (sessionIdRef.current !== null) {
      await updateSessionStatus('RUNNING');
    } else {
      const success = await startSessionOnServer(isFocus ? 'FOCUS' : 'BREAK');
      if (!success) {
        console.error("Error starting session.");
        return;
      }
    }

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
    if (isFocus) await commitFocusTime('PAUSED');

    setIsRunning(false);
    isRunningRef.current = false;
    externalTimerStateRef.current.isRunning = false;
    externalTimerStateRef.current.isPaused = true;
    onRunningChange(false);
    setWasPaused(true);
  };

  const stopTimer = async () => {
    if (isRunning && isFocus) await commitFocusTime();

    await updateSessionStatus('STOPPED', focusAccumulated);

    setIsRunning(false);
    isRunningRef.current = false;
    externalTimerStateRef.current.isRunning = false;
    externalTimerStateRef.current.isPaused = false;
    onRunningChange(false);

    setWasPaused(false);
    setIsFocus(true);
    setRemainingSeconds(FOCUS_DURATION);
    setFocusAccumulated(0);
    sessionStartRef.current = null;

    controlsRef.current?.stop();
    progress.set(0);
    progress.clearListeners();
  };

  const handleDistraction = async () => {
    if (isRunning && isFocus) {
      await commitFocusTime();
      await updateSessionStatus('PAUSED', focusAccumulated);
      console.log('Distraction triggered. Session ID:', sessionIdRef.current);
    }

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
  };

  // API interaction helpers
  const startSessionOnServer = async (type: 'FOCUS' | 'BREAK'): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) {
      console.error('No access token found');
      return false;
    }

    // prevent duplicate sessions
    if (sessionIdRef.current !== null) {
      console.warn('Session already exists, skipping POST.');
      return true;
    }

    try {
      const res = await fetch(`https://${import.meta.env.VITE_API_URL}/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, access_token }),
      });

      if (!res.ok) {
        console.error('Failed to start session');
        return false;
      }

      const response = await res.json();
      setSessionId(response.id);
      sessionIdRef.current = response.id;
      return true;
    } catch (err) {
      console.error('Error starting session:', err);
      return false;
    }
  };

  const updateSessionStatus = async (
    status: 'PAUSED' | 'STOPPED' | 'COMPLETED' | 'RUNNING',
    focusSecs?: number
  ) => {
    if (sessionIdRef.current === null) return;

    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) {
      console.error('No access token found');
      return;
    }

    const url = new URL(`https://${import.meta.env.VITE_API_URL}/sessions/${sessionIdRef.current}/update`);
    url.searchParams.set('status', status);
    if (focusSecs !== undefined) {
      url.searchParams.set('focus_secs', focusSecs.toString());
    }

    try {
      const res = await fetch(url.toString(), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token }),
      });

      if (!res.ok) {
        console.error(`Failed to update session to ${status}`);
      }
    } catch (err) {
      console.error(`Error updating session to ${status}:`, err);
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
      externalTimerControlsRef.current.nextSession = stopTimer; // instead of nextSession
      externalTimerControlsRef.current.distraction = handleDistraction;
    }
  }, []);

  const nextSession = async () => {
    if (isRunningRef.current && isFocus) {
      await commitFocusTime('COMPLETED');

      // 🔧 Reset before creating the next session
      sessionIdRef.current = null;
      setSessionId(null);
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

      <div className="d-flex justify-content-center align-items-center">
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
