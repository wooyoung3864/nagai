// components/WebcamFeed.tsx
import React from 'react';
import './WebcamFeed.css';
import joo from '../../assets/imgs/joo_studying.jpg';

export default function WebcamFeed() {
  return (
    <div className="webcam-feed">
      <img src={joo} alt="Webcam feed" />
    </div>
  );
}