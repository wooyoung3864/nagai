// src/components/WebcamFeed/WebcamFeed.tsx
import { useEffect, useRef } from 'react';
import './WebcamFeed.css';
import { motion } from 'framer-motion';
import useIsMobile from '../../hooks/useIsMobile';
import palmImg from '../../assets/imgs/palm.png';
import backOfHandImg from '../../assets/imgs/back_of_hand.png';

interface WebcamFeedProps {
  showOverlay: boolean;
  setCameraAvailable: (value: boolean) => void;
  setErrorMessage: (msg: string) => void;
  cameraAvailable: boolean;
  errorMessage: string;
  cameraInitialized: boolean;
  setCameraInitialized: (value: boolean) => void;
}

export default function WebcamFeed({
  showOverlay,
  setCameraAvailable,
  cameraInitialized,
  setCameraInitialized,
  setErrorMessage,
  cameraAvailable,
  errorMessage,
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const initCamera = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          if (stream.active) {
            setCameraAvailable(true);
            setErrorMessage('');
          } else {
            setCameraAvailable(false);
            setErrorMessage('Stream is inactive.\nPlease try again.');
          }
          setCameraInitialized(true); // ← add this
        })
        .catch((err) => {
          console.error('webcam error:', err);
          setCameraAvailable(false);
          // (error handling logic stays the same)
          setCameraInitialized(true); // ← add this
        });

    };

    initCamera();
  }, [setCameraAvailable, setErrorMessage]);

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
              <div className='overlay-grid-wrap'>
                <div className='overlay-grid-col'>
                  <div className='overlay-grid-header'>
                    <h2 className='overlay-text margin-left-1rem'>
                      Raise your hand like:
                    </h2>
                  </div>
                  <div className='overlay-grid-row'>
                    <div className='overlay-grid-cell'>
                      <img src={palmImg} className='palm-icon' alt="Palm gesture" /><h2 className='overlay-text margin-left-2rem'>
                        {isMobile ? 'to stop.' : 'to stop the timer/break.'}
                      </h2>
                    </div>
                    <div className='overlay-grid-cell'>
                      <img src={backOfHandImg} className='back-of-hand-icon' alt="Back of hand gesture" />
                      <h2 className='overlay-text margin-left-2rem'>
                        {isMobile ? 'to pause.' : 'to pause the timer.'}
                      </h2>

                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <video ref={videoRef} autoPlay muted playsInline />
        </>
      ) : (
        // Don't show this unless cameraInitialized is true
        cameraInitialized && (
          <div className="webcam-error">
            <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
            <button
              className="retry-camera-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )
      )}
    </div>
  );
}
