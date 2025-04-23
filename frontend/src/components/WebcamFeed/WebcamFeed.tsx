// src/components/WebcamFeed/WebcamFeed.tsx
import React, { useEffect, useRef } from 'react';
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
              {/* Overlay content */}
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
