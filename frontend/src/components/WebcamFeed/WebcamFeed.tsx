/* ────────────────────────────────────────────────────────────────────────────
   src/components/WebcamFeed/WebcamFeed.tsx
   Keeps the <video> mounted at all times, waits for loadedmetadata before
   flipping cameraAvailable, and starts behaviour-detection only after the ref
   is guaranteed to be set.  No duplicate getUserMedia calls.
   ────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './WebcamFeed.css';

import palmImg from '../../assets/imgs/palm.png';
import fistImg from '../../assets/imgs/fist.png';

import { useBehaviorDetection } from '../../hooks/useBehaviorDetection';
import useIsMobile from '../../hooks/useIsMobile';
import { SessionHandler } from '../../hooks/useSessionHandler';   // ← new
import { SupabaseClient } from '@supabase/supabase-js';

/* ────────────────────────── prop types ────────────────────────── */
export interface WebcamFeedProps {
  isWidescreen: boolean;
  showOverlay: boolean;
  setShowOverlay: (value: (prev: boolean) => boolean) => void;
  setCameraAvailable: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
  cameraAvailable: boolean;
  errorMessage: string;
  cameraInitialized: boolean;
  setCameraInitialized: (value: boolean) => void;
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
  }>;
  supabase: SupabaseClient
  sessionIdRef: SessionHandler['sessionIdRef'];
  setSessionId: SessionHandler['setSessionId'];
  onMotionDetected: () => void;  // Callback when motion is detected
}

/* ─────────────────────────── component ────────────────────────── */
export default function WebcamFeed({
  showOverlay,
  setShowOverlay,
  setCameraAvailable,
  setErrorMessage,
  isWidescreen,
  cameraAvailable,
  errorMessage,
  cameraInitialized,
  setCameraInitialized,
  externalTimerControlsRef,
  externalTimerStateRef,
  supabase,
  sessionIdRef,
  onMotionDetected
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);   // keep stream alive
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [_, setIsFullscreen] = useState(false);

  // state for spinner message
  const [spinnerMsg, setSpinnerMsg] = useState<string | null>(null);

  /** helper: show msg + spinner for N ms */
  const showTempSpinner = (msg: string, duration = 3000) => {
    setSpinnerMsg(msg);
    setTimeout(() => setSpinnerMsg(null), duration);
  };

  /* replace onMotionDetected prop with a wrapped version */
  const handleMotionDetected = () => {
    showTempSpinner('Motion Detected!  Please hold your hand still.', 3000);
    onMotionDetected();                  // keep the original callback
  };

  /* new error handler coming from useBehaviorDetection */
  const handleGeminiError = () => {
    showTempSpinner('Please try again.', 4500);
  };

  const behaviorDetection = useBehaviorDetection({
    videoRef,
    externalTimerControlsRef,
    externalTimerStateRef,
    supabase,
    sessionIdRef,
    onFocusScore: () => { }, // no-op handler
    onMotionDetected: handleMotionDetected,   // ⬅ wrapped
    onAnalysisError: handleGeminiError,       // ⬅ NEW
  });
  const {
    startBehaviorDetection = () => { },
    stopBehaviorDetection = () => { },
  } = behaviorDetection || {};
  /* full screen */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  /* ───────────── initialize camera once ───────────── */
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          /** Fix by ChatGPT (o3).
           * wyjung (05/19): fixed WebcamFeed HTMLVideoElement not loading in Vercel production build. wait for onloadedmetadata AND THEN setCameraAvailable(true). 
           */
          /* wait until browser has video metadata */
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play().catch(console.error);
            setCameraAvailable(true);            // ref is now non-null
          };
        }
      } catch (err: any) {
        console.error('[Webcam] getUserMedia failed:', err);
        setCameraAvailable(false);
        setErrorMessage('Webcam access error.\nCheck camera permissions.');
      } finally {
        setCameraInitialized(true);
      }
    })();

    /* clean up stream on unmount */
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [setCameraAvailable, setCameraInitialized, setErrorMessage]);

  /* ─────── start / stop behaviour detection ─────── */
  useEffect(() => {
    if (cameraAvailable) startBehaviorDetection();
    else stopBehaviorDetection();
  }, [cameraAvailable, startBehaviorDetection, stopBehaviorDetection]);

  /* optional: log media errors */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onErr = () =>
      console.error('[VIDEO-ERROR]', v.error?.code, v.error?.message || 'no msg');

    v.addEventListener('error', onErr);
    return () => v.removeEventListener('error', onErr);
  }, []);

  /* ────────────────────────── render ────────────────────────── */
  // TODO (jhjun & wyjung): Fix timer resetting after switching back from widescreen mode
  return (
    <div className={`webcam-feed ${isWidescreen ? 'widescreen' : ''}`} ref={containerRef}>
      {/* always mount the video; hide it until cameraAvailable */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={cameraAvailable ? '' : 'video--hidden'}
      />

      {cameraAvailable && showOverlay && (
        <motion.div
          className="gesture-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setShowOverlay(prev => !prev)}  /* tap to dismiss */
        >
          <div className="overlay-grid-wrap">
            <div className="overlay-grid-col">
              <h2 className="overlay-text margin-left-1rem">Raise your hand like:</h2>

              <div className="overlay-grid-row">
                <div className="overlay-grid-cell">
                  <img src={palmImg} className="palm-icon" alt="Palm" />
                  <h2 className="overlay-text margin-left-2rem">
                    {isMobile ? 'to stop.' : 'to start/stop timer.'}
                  </h2>
                </div>

                <div className="overlay-grid-cell">
                  <img src={fistImg} className="fist-icon" alt="Fist" />
                  <h2 className="overlay-text margin-left-2rem">
                    {isMobile ? 'to pause/resume.' : 'to pause/resume timer.'}
                  </h2>
                </div>
              </div>

              <h2 className="overlay-text margin-left-1rem">
                Keep your hand up for 3&nbsp;seconds.
              </h2>
            </div>
          </div>
        </motion.div>
      )}

      {/* NEW spinner / status overlay */}
      {spinnerMsg && !showOverlay && (
        <motion.div
          className="spinner-overlay gesture-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setShowOverlay(prev => !prev)}  /* tap to dismiss */
         /* full-screen translucent */>
          <div className='overlay-grid-wrap'>
            <div className='overlay-grid-col'>
              <div className='overlay-grid-row'>
                <div className='loading-spinner-wrap'>
                  <div className="loading-spinner" />
                </div>
              </div>
              <p className="overlay-text overlay-grid-row">{spinnerMsg}</p>
            </div>

          </div>
        </motion.div>
      )
      }

      {
        !cameraAvailable && cameraInitialized && (
          <div className="webcam-error">
            <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
            <button
              className="retry-camera-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )
      }
    </div >
  );
}
