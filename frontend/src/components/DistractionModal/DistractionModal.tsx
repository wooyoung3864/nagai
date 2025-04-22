import React from 'react';
import './DistractionModal.css';

interface DistractionModalProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export default function DistractionModal({ isVisible, onDismiss }: DistractionModalProps) {
  if (!isVisible) return null;

  return (
    <div className="gesture-overlay">
      <div className="distraction-modal">
        <h1>Distraction Detected!</h1>
        <p>Try to focus on your task.</p>
        <button onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  );
}
