// src/components/WebcamFeed/WebcamFeed.tsx
import React, { useEffect, useRef } from 'react';
import './WebcamFeed.css';
import { motion } from 'framer-motion';

interface WebcamFeedProps {
  showOverlay: boolean;
  setCameraAvailable: (value: boolean) => void;
  setErrorMessage: (msg: string) => void;
  cameraAvailable: boolean;
  errorMessage: string;
}

export default function WebcamFeed({
  showOverlay,
  setCameraAvailable,
  setErrorMessage,
  cameraAvailable,
  errorMessage,
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const initCamera = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          // Even if videoRef hasn't rendered yet, stream is active
          if (stream.active) {
            setCameraAvailable(true);
            setErrorMessage('');
          } else {
            setCameraAvailable(false);
            setErrorMessage('Stream is inactive.\nPlease try again.');
          }
        })
        .catch((err) => {
          console.error('webcam error:', err);
          setCameraAvailable(false);

          if (err.name === 'NotAllowedError') {
            setErrorMessage(
              'Webcam access denied.\nPlease enable it in your browser settings and try again.'
            );
          } else if (err.name === 'NotFoundError') {
            setErrorMessage(
              'No webcam device found.\nPlease connect a camera and try again.'
            );
          } else {
            setErrorMessage('Unable to access your webcam.\nPlease try again.');
          }
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
            />
          )}
          <video ref={videoRef} autoPlay muted playsInline />
        </>
      ) : (
        <div className="webcam-error">
          <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
          <button
            className="retry-camera-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
