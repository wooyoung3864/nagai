import React, { useEffect } from 'react';
import './FocusLog.css';
import Calendar from '../Calendar/Calendar';

interface FocusLogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailyData {
  date: string; // e.g., "2025-01-03"
  focusTime: string;
}

const focusData: DailyData[] = [
  { date: '2025-01-01', focusTime: '1h 30m'},
  { date: '2025-01-02', focusTime: '2h 10m'},
  // ...
];

const FocusLog: React.FC<FocusLogProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null; 

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if(event.key === "Escape"){
               onClose();
            }
        };    
        window.addEventListener("keydown", handleKeyDown);    
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []); 

    return (
      <div className="modal-overlay">
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
      </div>
    );
};

export default FocusLog;