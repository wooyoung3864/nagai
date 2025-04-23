import React from 'react';
import { motion } from 'framer-motion';
import './DistractionModal.css';

interface DistractionModalProps {
  isVisible: boolean;
  onDismiss: () => void;  // hide the modal
}

export default function DistractionModal({
  isVisible,
  onDismiss
}: DistractionModalProps) {
  if (!isVisible) return null;

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <motion.div
      className="distraction-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="distraction-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1>Distraction Detected!</h1>
        <p>Try to focus on your task.</p>
        <button onClick={handleDismiss}>Dismiss</button>
      </motion.div>
    </motion.div>
  );
}
