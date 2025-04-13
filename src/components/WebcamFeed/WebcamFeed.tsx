import React, { useEffect, useRef, useState } from 'react';
import './WebcamFeed.css';

export default function WebcamFeed() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState(true); 

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraAvailable(true);
        }
      })
      .catch((err) => {
        console.error('webcam error:', err);
        setCameraAvailable(false); 
      });
  }, []);

  return (
    <div className="webcam-feed">
      {cameraAvailable ? (
        <video ref={videoRef} autoPlay muted playsInline />
      ) : (
        <div className="webcam-error">
          <p>Unnable to load your webcam.</p>
          <p>Make sure webcam access is allowed in your browser settings.</p>
        </div>
      )}
    </div>
  );
}
