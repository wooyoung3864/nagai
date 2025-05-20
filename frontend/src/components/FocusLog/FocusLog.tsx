// frontend/src/components/FocusLog/FocusLog.tsx
import React, { useEffect } from 'react';
import './FocusLog.css';
import Calendar from '../Calendar/Calendar';
import { motion } from 'framer-motion';

interface FocusLogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailyData {
  date: string; // e.g., "2025-01-03" 
  focusTime: string;
  focusCycle: number;
}

const cycleCalculator = (timeStr: string) => {
  const hm = timeStr.split(/[ hm]+/).filter(Boolean); // removes empty strings
  const totalMin = parseFloat(hm[0]) * 60 + parseFloat(hm[1]);
  const cycle = totalMin / 25.0;
  return cycle
}

const focusData: DailyData[] = [
  { date: '2025-01-01', focusTime: '1h 30m', focusCycle: cycleCalculator('1h 30m') },
  { date: '2025-01-02', focusTime: '2h 10m', focusCycle: cycleCalculator('2h 10m') },
  // ...
];

const FocusLog: React.FC<FocusLogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Focus Log</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <Calendar data={focusData} />
        </div>
        <div className="modal-footer">

        </div>
      </div>
    </motion.div>
  );
};

export default FocusLog;