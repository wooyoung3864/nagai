// src/components/WebcamFeed/WebcamFeed.tsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './WebcamFeed.css';
import palmImg from '../../assets/imgs/palm.png';
import fistImg from '../../assets/imgs/fist.png';
import { useBehaviorDetection } from '../../hooks/useBehaviorDetection';
import useIsMobile from '../../hooks/useIsMobile';

// WebcamFeed.tsx
export interface WebcamFeedProps {
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
}

export default function WebcamFeed({
  showOverlay,
  // setShowOverlay,
  setCameraAvailable,
  setErrorMessage,
  cameraAvailable,
  errorMessage,
  cameraInitialized,
  setCameraInitialized,
  externalTimerControlsRef,
  externalTimerStateRef
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isMobile = useIsMobile();

  const { startBehaviorDetection, stopBehaviorDetection } = useBehaviorDetection({
    videoRef,
    externalTimerControlsRef,
    externalTimerStateRef,
  });

  const streamRef = useRef<MediaStream | null>(null); // Keep stream alive globally

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          /* 2️⃣  Wait for metadata before playing */
          const onMeta = () => {
            videoRef.current?.play().catch(console.error);
            setCameraAvailable(true);        // mount-time check
            videoRef.current?.removeEventListener('loadedmetadata', onMeta);
          };
          videoRef.current.addEventListener('loadedmetadata', onMeta);
        }
      } catch (err: any) {
        console.error('[Webcam] getUserMedia failed:', err);
        setCameraAvailable(false);
        setErrorMessage('Could not access webcam.\nCheck permissions.');
      } finally {
        setCameraInitialized(true);
      }
    })();

    /* 🔌  Clean-up */
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    console.log(`videoRef.current: ${videoRef.current}`)
    if (!v) return;

    const onErr = () => {
      console.error(
        '[VIDEO-ERROR]',
        v.error?.code,
        v.error?.message || 'no msg'
      );
    };
    v.addEventListener('error', onErr);

    return () => v.removeEventListener('error', onErr);
  }, []);

  useEffect(() => {
    if (cameraAvailable && videoRef.current) startBehaviorDetection();
    else stopBehaviorDetection();
  }, [cameraAvailable]);

  return (
    <div className="webcam-feed">
      {cameraAvailable ? (
        <>
          {showOverlay && (
            <motion.div
              className="gesture-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="overlay-grid-wrap">
                <div className="overlay-grid-col">
                  <h2 className="overlay-text margin-left-1rem">Raise your hand like:</h2>
                  <div className="overlay-grid-row">
                    <div className="overlay-grid-cell">
                      <img src={palmImg} className="palm-icon" alt="Palm" />
                      <h2 className="overlay-text margin-left-2rem">{isMobile ? 'to stop.' : 'to start/stop timer.'}</h2>
                    </div>
                    <div className="overlay-grid-cell">
                      <img src={fistImg} className="fist-icon" alt="Fist" />
                      <h2 className="overlay-text margin-left-2rem">{isMobile ? 'to pause.' : 'to pause timer.'}</h2>
                    </div>
                  </div>
                  <h2 className='overlay-text margin-left-1rem'>Keep your hand up for 3 seconds.</h2>
                </div>
              </div>
            </motion.div>
          )}
          <video ref={videoRef} autoPlay muted playsInline />
        </>
      ) : (
        cameraInitialized && (
          <div className="webcam-error">
            <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
            <button className='retry-camera-button' onClick={() => window.location.reload()}>Retry</button>
          </div>
        )
      )}
    </div>
  );
}
