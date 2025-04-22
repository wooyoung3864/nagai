// src/components/WebcamFeed/WebcamFeed.tsx
import React, { useEffect, useRef, useState } from 'react';
import './WebcamFeed.css';
import { motion, AnimatePresence } from 'framer-motion';

interface WebcamFeedProps {
  showOverlay: boolean;
}

export default function WebcamFeed({ showOverlay }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const initCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraAvailable(true);
          setErrorMessage('');
        }
      })
      .catch((err) => {
        console.error('webcam error:', err);
        setCameraAvailable(false);

        // Custom error message based on type
        if (err.name === 'NotAllowedError') {
          setErrorMessage(
            'Webcam access denied.\nPlease enable it in your browser settings and try again.'
          );
        } else if (err.name === 'NotFoundError') {
          setErrorMessage(
            'No webcam device found.\nPlease connect a camera and try again.'
          );
        } else {
          setErrorMessage(
            'Unable to access your webcam.\nPlease try again.'
          );
        }
      });
  };

  useEffect(() => {
    initCamera();
  }, []);

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
          <button className="retry-camera-button" onClick={() => window.location.reload()}>
            Try Again
          </button>

        </div>
      )}
    </div>
  );
}
